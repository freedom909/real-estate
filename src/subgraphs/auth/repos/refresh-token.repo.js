import { createRedis } from "../../../infrastructure/redis/redis.js";
import jwt from "jsonwebtoken";
import { hashToken } from "../../../shared/security/hash.js";

export default class RefreshTokenRepo {
  constructor({ RefreshTokenModel }) {
    if (!RefreshTokenModel) {
      throw new Error("RefreshTokenModel not injected");
    }
    this.model = RefreshTokenModel;
  }

  /**
   * 🔒 原子：校验 + 标记 used（防并发）
   */
  async consume(refreshToken) {
    const payload = jwt.decode(refreshToken);

    if (!payload?.jti) return null;

    return this.model.findOneAndUpdate(
      {
        tokenId: payload.jti,
        status: "active",
      },
      {
        $set: {
          status: "used",
          rotatedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async revokeBySession(sessionId) {
    return this.model.updateMany(
      { sessionId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }
  
  /**
   * 💾 保存新 refresh token（只存 hash）
   */
  async save(refreshToken, meta) {
    const payload = jwt.decode(refreshToken);

    if (!payload?.jti) {
      throw new Error("refreshToken_JTI_MISSING");// error "refreshToken_JTI_MISSING"
    }

    return this.model.create({
      tokenId: payload.jti, // ✅ 唯一
      userId: meta.userId,
      familyId: meta.familyId,
      deviceId: meta.deviceId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      issuedAt: new Date(),
    });
  }


  /**
   * 🚨 revoke 某个 token family（并发 / 攻击）
   */
  async revokeFamily(familyId) {
    await this.model.updateMany(
      {
        familyId,
        status: "active",
      },
      {
        $set: {
          status: "revoked",
          revokedAt: new Date(),
        },
      }
    );
  }

  /**
   * 🚪 单设备登出
   */
  async revokeByDevice(userId, deviceId) {
    await this.model.updateMany(
      {
        userId,
        deviceId,
        status: "active",
      },
      {
        $set: {
          status: "revoked",
          revokedAt: new Date(),
        },
      }
    );
  }

  /**
   * 🧨 全用户登出（配合 tokenVersion）
   */
  async revokeAllByUser(userId) {
    await this.model.updateMany(
      {
        userId,
        status: "active",
      },
      {
        $set: {
          status: "revoked",
          revokedAt: new Date(),
        },
      }
    );
  }
}
