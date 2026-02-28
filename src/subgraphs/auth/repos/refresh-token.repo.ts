// src/subgraphs/auth/repos/refreshToken.repo.ts

import jwt from "jsonwebtoken";
import { hashToken } from "../../../shared/security/hash";
import { Document, Model } from 'mongoose';
import { RefreshToken } from '../models/refreshToken.model';

interface RefreshTokenDocument extends RefreshToken, Document {}

interface RefreshTokenMeta {
  userId: string;
  familyId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
}

export default class RefreshTokenRepo {
  private model: Model<RefreshToken>;

  constructor({ RefreshTokenModel }: { RefreshTokenModel: Model<RefreshToken> }) {
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
async save(
  refreshToken: string,
  meta: RefreshTokenMeta & { jti: string; expiresAt: Date }
) {
  console.log("refreshToken:",refreshToken)// undefined
  const tokenHash = hashToken(refreshToken);
 console.log("tokenHash:",tokenHash)
  return this.model.create({
    tokenId: meta.jti,
    tokenHash,
    expiresAt: meta.expiresAt,
    ...meta,
  });
}

  async findByJti(jti: string): Promise<RefreshTokenDocument | null> {
    return this.model.findOne({ tokenId: jti });
  }

async deleteByJti(jti: string): Promise<void> {
  await this.model.deleteOne({ tokenId: jti });
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