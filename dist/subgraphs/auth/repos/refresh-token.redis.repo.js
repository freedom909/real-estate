import redis from "../../../infrastructure/redis/redis";
import crypto from "crypto";
const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");
export default class RedisRefreshTokenRepo {
    async save({ userId, token, sessionId, deviceId, ttl }) {
        const h = hash(token);
        const pipeline = redis.pipeline();
        pipeline.hset(`refresh:${h}`, {
            userId,
            sessionId,
            deviceId,
        });
        pipeline.expire(`refresh:${h}`, ttl);
        pipeline.sadd(`user:${userId}:refreshTokens`, h);
        pipeline.sadd(`user:${userId}:devices:${deviceId}`, sessionId);
        await pipeline.exec();
    }
    async get(token) {
        return redis.hgetall(`refresh:${hash(token)}`);
    }
    async delete(token) {
        const h = hash(token);
        const meta = await redis.hgetall(`refresh:${h}`);
        if (!meta.userId)
            return;
        const pipeline = redis.pipeline();
        pipeline.del(`refresh:${h}`);
        pipeline.srem(`user:${meta.userId}:refreshTokens`, h);
        pipeline.srem(`user:${meta.userId}:devices:${meta.deviceId}`, meta.sessionId);
        await pipeline.exec();
    }
    async revokeSession(userId, sessionId) {
        const keys = await redis.keys("refresh:*");
        for (const key of keys) {
            const meta = await redis.hgetall(key);
            if (meta.userId === userId &&
                meta.sessionId === sessionId) {
                await redis.del(key);
            }
        }
    }
    async revokeDevice(userId, deviceId) {
        const sessions = await redis.smembers(`user:${userId}:devices:${deviceId}`);
        for (const sid of sessions) {
            await this.revokeSession(userId, sid);
        }
        await redis.del(`user:${userId}:devices:${deviceId}`);
    }
    async revokeAll(userId) {
        const hashes = await redis.smembers(`user:${userId}:refreshTokens`);
        const pipeline = redis.pipeline();
        hashes.forEach((h) => pipeline.del(`refresh:${h}`));
        pipeline.del(`user:${userId}:refreshTokens`);
        await pipeline.exec();
    }
}
