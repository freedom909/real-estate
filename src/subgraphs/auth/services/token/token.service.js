// src/subgraphs/auth/services/token/token.service.js

import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

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
    return payload;
  }

  // （可选，但强烈推荐）
  verifyAccessToken(token) {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: [this.algorithm],
      issuer: this.issuer,
    });
  }

  issueTokens({ userId }) {
    if (!userId) throw new Error("Invalid userId");// if 'id' not 'userId'?
    const accessToken = this.generateAccessToken({ userId });
    const refreshToken = this.generateRefreshToken({userId });
    return {
      accessToken,
      refreshToken,
    };
 
  }
  
}

