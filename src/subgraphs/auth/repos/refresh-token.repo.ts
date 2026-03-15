// src/subgraphs/auth/repos/refreshToken.repo.ts

import jwt from "jsonwebtoken";
import { hash } from "../../../shared/security/hash";
import { Document, Model } from 'mongoose';
import { RefreshToken, RefreshTokenMeta } from '../models/refreshToken.model';
import { injectable } from "tsyringe";

interface RefreshTokenDocument extends RefreshToken, Document {}

@injectable()
export default class RefreshTokenRepository {
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

  return this.model.create({
    tokenId: meta.jti,
    token: hash(refreshToken),
    status: "active",
    meta: {
      userId: meta.userId,
      familyId: meta.familyId,
      sessionId: meta.sessionId,
      issuedAt: meta.issuedAt ?? new Date(),
      expiresAt: meta.expiresAt
    }
  });
}

  async findByJti(jti: string): Promise<RefreshTokenDocument | null> {
    return this.model.findOne({ tokenId: jti });
  }

async deleteByJti(jti: string): Promise<void> {
  await this.model.deleteOne({ tokenId: jti });
}

async markAsUsed(jti: string, usedAt: Date): Promise<void> {
  await this.model.updateOne(
    { tokenId: jti,usedAt: Date.now()},
    { $set: { status: "used", rotatedAt: new Date() } }
  );
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