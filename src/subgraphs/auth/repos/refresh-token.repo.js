// src/subgraphs/auth/repos/refresh-token.repo.js
import  redis  from "../../../shared/redis/redis.client.js";
import { hashToken } from "../../../shared/security/hash.js";

export default class RefreshTokenRepo {
    constructor({ RefreshTokenModel }) {
    this.model = RefreshTokenModel;
  }
  async save(userId, refreshToken) {
    const hash = hashToken(refreshToken);

    await redis.multi()
      .set(`refresh:${hash}`, userId, "EX", 60 * 60 * 24 * 30)
      .sadd(`user:${userId}:refreshTokens`, hash)
      .exec();
  }

    async create(data) {
    return this.model.create(data);
  }

  async exists(refreshToken) {
    const hash = hashToken(refreshToken);
    return Boolean(await redis.get(`refresh:${hash}`));
  }

  async delete(refreshToken) {
    const hash = hashToken(refreshToken);
    const userId = await redis.get(`refresh:${hash}`);
    if (!userId) return;

    await redis.multi()
      .del(`refresh:${hash}`)
      .srem(`user:${userId}:refreshTokens`, hash)
      .exec();
  }

async revoke(tokenId, replacedByTokenId = null) {
    console.log("🟢 [RT] revoke", { tokenId, replacedByTokenId });
    return this.model.updateOne(
      { tokenId },
      {
        revoked: true,
        revokedAt: new Date(),
        replacedByTokenId,
      }
    );
  }

async revokeAllByUser(userId) {
    console.log("🟢 [RT] revokeAllByUser", { userId });
    return this.model.updateMany(
      { userId, revoked: false },
      {
        revoked: true,
        revokedAt: new Date(),
      }
    );
  }

  async revokeAll(userId) {
    const hashes = await redis.smembers(
      `user:${userId}:refreshTokens`
    );

    const tx = redis.multi();
    hashes.forEach((h) => tx.del(`refresh:${h}`));
    tx.del(`user:${userId}:refreshTokens`);
    await tx.exec();
  }

    async findByTokenId(tokenId) {
    return this.model.findOne({ tokenId });
  }
}
