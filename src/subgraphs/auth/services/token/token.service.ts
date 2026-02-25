// src/subgraphs/auth/services/token/token.service.ts

import dotenv from "dotenv";
dotenv.config();
import * as crypto from "crypto";
import jwt, {
  SignOptions,
  VerifyOptions,
  Algorithm,
  JwtPayload,
} from "jsonwebtoken";
import fs from "fs";
import { randomUUID } from "crypto";

/* ===============================
   Types
================================ */

export interface TokenPayload extends JwtPayload {
  sub: string;
  role?: string;
  email?: string;
  type: "access" | "refresh";
  tokenVersion?: number;
  familyId?: string;
  deviceId?: string;
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
}

/* ===============================
   Token Service
================================ */

export default class TokenService {
  private privateKey: string;
  private publicKey: string;
  private issuer: string;
  private algorithm: Algorithm = "RS256";
  private accessExpiresIn: SignOptions["expiresIn"];
  private refreshExpiresIn: SignOptions["expiresIn"];

  constructor() {
    const privateKeyPath = process.env.JWT_PRIVATE_KEY;
    const publicKeyPath = process.env.JWT_PUBLIC_KEY;

    if (!privateKeyPath || !publicKeyPath) {
      throw new Error("JWT key paths not configured");
    }

    this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
    this.publicKey = fs.readFileSync(publicKeyPath, "utf8");

    this.issuer = process.env.JWT_ISSUER || "auth-service";
   this.accessExpiresIn =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";

this.refreshExpiresIn =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "30d";
  }

  /* ===============================
     Access Token
  ============================== */



signAccessToken(payload: Omit<TokenPayload, "type">): string {

  console.log(
    "PRIVATE KEY HASH:",
    crypto
      .createHash("sha256")
      .update(this.privateKey)
      .digest("hex")
  );

  const token = jwt.sign(
    {
      ...payload,
      type: "access",
    },
    this.privateKey,
    {
      algorithm: "RS256",
      expiresIn: "15m",
    }
  );

  return token;
}

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
      }) as TokenPayload;

      if (decoded.type !== "access") {
        throw new Error("Invalid access token type");
      }

      return decoded;
    } catch (error: any) {
      throw new Error(`Access token verification failed: ${error.message}`);
    }
  }

  /* ===============================
     Refresh Token
  ============================== */

  signRefreshToken(
    payload: Omit<TokenPayload, "type">
  ): { token: string; jti: string } {
    const jti = randomUUID();

    const token = jwt.sign(
      {
        ...payload,
        type: "refresh",
      },
      this.privateKey,
      {
        algorithm: this.algorithm,
        issuer: this.issuer,
        expiresIn: this.refreshExpiresIn,
        jwtid: jti,
      }
    );

    return { token, jti };
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
      }) as TokenPayload;

      if (decoded.type !== "refresh") {
        throw new Error("Invalid refresh token type");
      }

      return decoded;
    } catch (error: any) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  /* ===============================
     Issue Both Tokens
  ============================== */

  issueTokens({
    userId,
    role,
    email,
    tokenVersion = 0,
    familyId,
    deviceId,
    sessionId,
  }: {
    userId: string;
    role?: string;
    email?: string;
    tokenVersion?: number;
    familyId?: string;
    deviceId?: string;
    sessionId?: string;
  }): TokenPair {
    const accessToken = this.signAccessToken({
      sub: userId,
      role,
      email,
      tokenVersion,
      familyId,
      deviceId,
      sessionId,
    });

    const { token: refreshToken, jti } = this.signRefreshToken({
      sub: userId,
      role,
      email,
      tokenVersion,
      familyId,
      deviceId,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
      refreshJti: jti,
    };
  }

  /* ===============================
     TTL Helpers
  ============================== */

  getAccessTokenTTL(): SignOptions["expiresIn"] {
    return this.accessExpiresIn;
  }

  getRefreshTokenTTL(): number {
    const ttl = this.refreshExpiresIn;

    if (typeof ttl === "number") return ttl;

    const match = ttl.match(/^(\d+)([dhms])$/);
    if (!match) return 30 * 24 * 60 * 60;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        return value * 24 * 60 * 60;
      case "h":
        return value * 60 * 60;
      case "m":
        return value * 60;
      case "s":
        return value;
      default:
        return 30 * 24 * 60 * 60;
    }
  }
}