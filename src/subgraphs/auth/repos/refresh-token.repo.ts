import { createRedis } from "../../../infrastructure/redis/redis.js";
import jwt from "jsonwebtoken";
import { hashToken } from "../../../shared/security/hash.js";
import { Document, Model } from 'mongoose';
import { RefreshToken } from '../models/refreshToken.model.js';

interface RefreshTokenDocument extends RefreshToken, Document {}

interface RefreshTokenMeta {
  userId: string;
  familyId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
}

export default class RefreshTokenRepo {
  private model: Model<RefreshTokenDocument>;

  constructor({ RefreshTokenModel }: { RefreshTokenModel: Model<RefreshTokenDocument> }) {
    if (!RefreshTokenModel) {
      throw new Error("RefreshTokenModel not injected");
    }
    this.model = RefreshTokenModel;
  }

  /**
   * 🔒 原子：校验 + 标记 used（防并发）
   */
  async consume(refreshToken: string): Promise<RefreshTokenDocument | null> {
    const payload: any = jwt.decode(refreshToken);

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

  async revokeBySession(sessionId: string) {
    return this.model.updateMany(
      { sessionId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  /**
   * 💾 保存新 refresh token（只存 hash）
   */
  async save(refreshToken: string, meta: RefreshTokenMeta) {
    const payload: any = jwt.decode(refreshToken);

    if (!payload?.jti) {
      throw new Error("REFRESH_TOKEN_JTI_MISSING");// error "REFRESH_TOKEN_JTI_MISSING"
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
  async revokeFamily(familyId: string) {
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
  async revokeByDevice(userId: string, deviceId: string) {
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
  async revokeAllByUser(userId: string) {
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