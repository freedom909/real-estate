// src/subgraphs/auth/services/token/token.service.js

import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const PRIVATE_KEY = fs.readFileSync(
  path.join(process.cwd(), "src/keys/private.pem"),
  "utf8"
);

const PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "src/keys/public.pem"),
  "utf8"
);

export default class TokenService {
  constructor() {
    this.issuer = process.env.JWT_ISSUER || "auth-service";
    this.algorithm = "RS256";
    this.accessExpiresIn =
      process.env.JWT_ACCESS_EXPIRES_IN || "15m";
    this.refreshExpiresIn =
      process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  }

  generateAccessToken({ userId, role, email }) {
    return jwt.sign(
      {
        sub: userId,
        role,
        email,
      },
      PRIVATE_KEY,
      {
        algorithm: this.algorithm,
        issuer: this.issuer,
        expiresIn: this.accessExpiresIn,
      }
    );
  }

  // Alias for compatibility with RefreshTokenService
  signAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: "access",
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: this.getAccessTokenTTL(),//not a func
      }
    );
  }

  // Alias for compatibility with RefreshTokenService
  signRefreshToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: "refresh",
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: this.getRefreshTokenTTL(),
        jwtid: randomUUID(), // ✅ 关键：jti
      }
    );
  }

  get accessTokenTTL() {
  return process.env.ACCESS_TOKEN_TTL || "15m";
}

  generateRefreshToken({ userId }) {
    return jwt.sign(
      {
        sub: userId,
        type: "refresh",
      },
      PRIVATE_KEY,
      {
        algorithm: this.algorithm,
        issuer: this.issuer,
        expiresIn: this.refreshExpiresIn,
      }
    );
  }


  // ✅ 新增
  verifyRefreshToken(token) {
    const payload = jwt.verify(token, PUBLIC_KEY, {
      algorithms: [this.algorithm],
      issuer: this.issuer,
    });

    if (payload.type !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    // Map 'sub' to 'userId' so RefreshTokenService can use it
    return {
      ...payload,
      userId: payload.sub,
    };
  }

  // （可选，但强烈推荐）
  verifyAccessToken(token) {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: [this.algorithm],
      issuer: this.issuer,
    });
  }

  getRefreshTokenTTL() {
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

getAccessTokenTTL() {
  return process.env.ACCESS_TOKEN_TTL || "15m";
}



issueTokens({ userId, tokenVersion = 0, familyId, deviceId }) {
  const accessToken = this.signAccessToken({
    sub: userId,
    tokenVersion,
  });

  const refreshToken = this.signRefreshToken({
    sub: userId,
    tokenVersion,
    familyId,
    deviceId,
  });

  return {
    accessToken,
    refreshToken,
  };
}


}
