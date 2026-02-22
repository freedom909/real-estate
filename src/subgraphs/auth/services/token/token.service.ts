// src/subgraphs/auth/services/token/token.service.ts

import dotenv from "dotenv";
dotenv.config();

import jwt, { SignOptions, VerifyOptions, Algorithm } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

if (!PRIVATE_KEY || !PUBLIC_KEY) {
  throw new Error("JWT keys not configured");
}


interface TokenPayload {
  sub: string;
  role?: string;
  email?: string;
  type?: string;
  tokenVersion?: number;
  familyId?: string;
  deviceId?: string;
  [key: string]: any;
}

interface TokenOptions {
  issuer: string;
  algorithm: string;
  expiresIn: string;
}

interface RefreshTokenVerificationResult {
  sub: string;
  userId: string;
  type: string;
  [key: string]: any;
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  refreshJti: string
}

export default class TokenService {
  private refreshPrivateKey: string;
  private refreshPublicKey: string;
  private issuer: string;
  private algorithm: Algorithm;
  private accessExpiresIn: string;
  private refreshExpiresIn: SignOptions["expiresIn"] = "7d";
constructor() {
  this.issuer = process.env.JWT_ISSUER || "auth-service";
  this.algorithm = "RS256";
  this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  this.refreshExpiresIn =
    (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"];

  this.refreshPrivateKey = PRIVATE_KEY!;
  this.refreshPublicKey = PUBLIC_KEY!;
}

  generateAccessToken({ userId, role, email }: { userId: string; role?: string; email?: string }): string {
    
    const options: SignOptions = {
      algorithm: this.algorithm,
      issuer: this.issuer,
      expiresIn: (this.accessExpiresIn || "15m") as SignOptions["expiresIn"],
    };
    
    return jwt.sign(
      {
        sub: userId,
        role,
        email,
      },
      this.refreshPrivateKey,
      options
    );
  }

  // Alias for compatibility with RefreshTokenService
  signAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      algorithm: this.algorithm,
      issuer: this.issuer,
      expiresIn: (this.accessExpiresIn || "15m") as SignOptions["expiresIn"],
    };

    return jwt.sign(
      {
        ...payload,
        type: "access",
      },
      this.refreshPrivateKey,
      options
    );
  }

  // Alias for compatibility with RefreshTokenService
signRefreshToken(payload: TokenPayload): { token: string; jti: string } {
  const jti = randomUUID();

  const token = jwt.sign(
   
    {
      ...payload,
      type: "refresh",
    },
    this.refreshPrivateKey,
    {
      algorithm: this.algorithm,
      issuer: this.issuer,
      expiresIn: this.refreshExpiresIn,
      jwtid: jti,
    }
    
  );

  return { token, jti };
}

  get accessTokenTTL(): string {
    return process.env.ACCESS_TOKEN_TTL || "15m";
  }

  generateRefreshToken({ userId }: { userId: string }): string {
    const options: SignOptions = {
      algorithm: this.algorithm,
      issuer: this.issuer,
      expiresIn: this.refreshExpiresIn,
    };
    
    return jwt.sign(
      {
        sub: userId,
        type: "refresh",
      },
      this.refreshPrivateKey,
      options
    );
  }

  // ✅ 新增
  verifyRefreshToken(token: string): RefreshTokenVerificationResult {
    let payload: jwt.JwtPayload | string;
    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm],
        issuer: this.issuer,
      };
      console.log("issuer", this.issuer)
      payload = jwt.verify(token, PUBLIC_KEY, options) as jwt.JwtPayload;
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }

    if (typeof payload === 'string' || payload.type !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    // Map 'sub' to 'userId' so RefreshTokenService can use it
    return {
      ...payload,
      userId: payload.sub,
    } as RefreshTokenVerificationResult;
  }

  // （可选，但强烈推荐）
  verifyAccessToken(token: string): TokenPayload {
    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm],
        issuer: this.issuer,
      };
       console.log("SIGNING issuer:", this.issuer);
      const decoded = jwt.verify(token, PUBLIC_KEY, options) as jwt.JwtPayload;
      return decoded as TokenPayload;
    } catch (error) {
      throw new Error(`Access token verification failed: ${error.message}`);
    }
  }

  getRefreshTokenTTL(): number {
    const ttl = this.refreshExpiresIn;
    if (typeof ttl === "number") return ttl;

    if (typeof ttl === "string") {
      const match = ttl.match(/^(\d+)([dhms])$/);
      if (match) {
        const val = parseInt(match[1], 10);
        const unit = match[2];
        if (unit === "d") return val * 24 * 60 * 60;
        if (unit === "h") return val * 60 * 60;
        if (unit === "m") return val * 60;
        if (unit === "s") return val;
      }
    }
    return parseInt(ttl) || 30 * 24 * 60 * 60; // Default 30d
  }

  getAccessTokenTTL(): string {
    return process.env.ACCESS_TOKEN_TTL || "15m";
  }

  issueTokens({ userId, tokenVersion = 0, familyId, deviceId }): TokenPair {
    const accessToken: string = this.signAccessToken({
      sub: userId,
      tokenVersion,
    });

    const { token: refreshToken, jti } = this.signRefreshToken({
      sub: userId,
      tokenVersion,
      familyId,
      deviceId,
    });

    return {
      accessToken,
      refreshToken,
      refreshJti: jti,
    };
     
  }
  
}