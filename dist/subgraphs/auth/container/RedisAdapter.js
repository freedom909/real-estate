export class RedisAdapter {
    constructor(redis) {
        this.redis = redis;
    }
    async set(key, value, options) {
        if (options?.ttl) {
            await this.redis.set(key, value, "EX", options.ttl);
        }
        else {
            await this.redis.set(key, value);
        }
    }
    async get(key) {
        return this.redis.get(key);
    }
    async del(key) {
        await this.redis.del(key);
    }
}
