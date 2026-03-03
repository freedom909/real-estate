// src/subgraphs/auth/services/token.service.ts

import jwt, { Algorithm, SignOptions, JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import fs from "fs";
import crypto from "crypto";
import { container } from "tsyringe";
import Blacklist from "@/shared/security/blacklist";
import { TOKENS } from "@/shared/container/tokens";


export interface TokenPayload extends JwtPayload {
  sub: string;
  role?: string;
  email?: string;

  type: "access" | "refresh";

  tokenVersion: number;
  familyId: string;
  sessionId: string;

  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
  refreshExpiresAt: Date;
}

export interface TokenConfig {
  issuer: string;
  algorithm: Algorithm;
  accessExpiresIn: SignOptions["expiresIn"];
  refreshExpiresIn: SignOptions["expiresIn"];
}

export interface KeyProvider {
  getPrivateKey(): string;
  getPublicKey(): string;
}

export default class TokenService {
  private privateKey: string;
  private publicKey: string;
  private config: TokenConfig;
  

  constructor(envKeyProvider: KeyProvider, config?: Partial<TokenConfig>) {
    if (!envKeyProvider) {
      throw new Error("TokenService: keyProvider is required");
    }
    const privateKey = envKeyProvider.getPrivateKey();
    const publicKey = envKeyProvider.getPublicKey();


    this.privateKey = privateKey;
    this.publicKey = publicKey;


    this.config = {
      issuer: config?.issuer ?? "auth-service",
      algorithm: config?.algorithm ?? "RS256",
      accessExpiresIn: config?.accessExpiresIn ?? "15m",
      refreshExpiresIn: config?.refreshExpiresIn ?? "7d",
    };
  }

  /* =========================================================
     ACCESS TOKEN
  ========================================================= */

signAccessToken(payload: Omit<TokenPayload, "type">): string {
  const jti = randomUUID();
  return jwt.sign(
    {
      ...payload,
      type: "access",
      jti,            // ✅ 加入 jti
    },
    this.privateKey,
    {
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      expiresIn: this.config.accessExpiresIn, // 15m
    }
  );
}

async verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const payload = jwt.verify(
      token,
      this.publicKey,
      {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
      }
    ) as TokenPayload;

    // 1️⃣ type check（防止 refresh 冒充 access）
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }

    // 2️⃣ jti 必须存在
    if (!payload.jti) {
      throw new Error("Token missing jti");
    }

    // 3️⃣ blacklist 检查
    const blacklist = container.resolve<Blacklist>(
      TOKENS.security.blacklist
    );

    const isBlacklisted = await blacklist.isBlacklisted(payload.jti);

    if (isBlacklisted) {
      throw new Error("Token is blacklisted");
    }

    return payload;
  } catch (err) {
    throw new Error("Unauthorized");
  }
}

  /* =========================================================
     REFRESH TOKEN
  ========================================================= */

  signRefreshToken(
    payload: Omit<TokenPayload, "type">
  ): { token: string; jti: string; expiresAt: Date } {
    const jti = randomUUID();

    const token = jwt.sign(
      {
        ...payload,
        type: "refresh",
        jti,
      },
      this.privateKey,
      {
        algorithm: this.config.algorithm,
        issuer: this.config.issuer,
        expiresIn: this.config.refreshExpiresIn,
      }
    );

    const expiresAt = new Date(
      Date.now() + this.parseExpires(this.config.refreshExpiresIn)
    );

    return { token, jti, expiresAt };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.publicKey, {
      algorithms: [this.config.algorithm],
      issuer: this.config.issuer,
    }) as TokenPayload;

    if (decoded.type !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    return decoded;
  }

  /* =========================================================
     ISSUE TOKEN PAIR
  ========================================================= */

  issueTokenPair(params: {
    userId: string;
    role?: string;
    email?: string;
    tokenVersion: number;
    familyId: string;
    sessionId: string;
    deviceId?: string;
    ip?: string;
    userAgent?: string;
  }): TokenPair {
    const {
      userId,
      role,
      email,
      tokenVersion,
      familyId,
      sessionId,
      deviceId,
      ip,
      userAgent,
    } = params;

    const basePayload = {
      sub: userId,
      role,
      email,
      tokenVersion,
      familyId,
      sessionId,
      deviceId,
      ip,
      userAgent,
    };

    const accessToken = this.signAccessToken(basePayload);

    const { token: refreshToken, jti, expiresAt } =
      this.signRefreshToken(basePayload);

    return {
      accessToken,
      refreshToken,
      refreshJti: jti,
      refreshExpiresAt: expiresAt,
    };
  }

  /* =========================================================
     INTERNAL UTILS
  ========================================================= */

  private parseExpires(expiresIn: SignOptions["expiresIn"]): number {
    if (typeof expiresIn === "number") return expiresIn * 1000;

    const match = /^(\d+)([smhd])$/.exec(expiresIn as string);
    if (!match) throw new Error("Invalid expiresIn format");

    const value = Number(match[1]);
    const unit = match[2];

    const map: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * map[unit];
  }

}