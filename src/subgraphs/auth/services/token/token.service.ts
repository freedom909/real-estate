// token.service.ts

import jwt, { Algorithm, SignOptions, JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { KeyProvider } from "./token.types";

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

export interface TokenConfig {
  issuer: string;
  algorithm: Algorithm;
  accessExpiresIn: SignOptions["expiresIn"];
  refreshExpiresIn: SignOptions["expiresIn"];
}

export default class TokenService {
  private privateKey: string;
  private publicKey: string;
  private config: TokenConfig;

  constructor(
    keyProvider: KeyProvider,
    config?: Partial<TokenConfig>
  ) {
    const keys = keyProvider.getKeys();

    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;

    this.config = {
      issuer: config?.issuer ?? "auth-service",
      algorithm: config?.algorithm ?? "RS256",
      accessExpiresIn: config?.accessExpiresIn ?? "15m",
      refreshExpiresIn: config?.refreshExpiresIn ?? "30d",
    };
  }

  /* ===============================
     Access Token
  ============================== */

  signAccessToken(payload: Omit<TokenPayload, "type">): string {
    return jwt.sign(
      { ...payload, type: "access" },
      this.privateKey,
      {
        algorithm: this.config.algorithm,
        issuer: this.config.issuer,
        expiresIn: this.config.accessExpiresIn,
      }
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.publicKey, {
      algorithms: [this.config.algorithm],
      issuer: this.config.issuer,
    }) as TokenPayload;

    if (decoded.type !== "access") {
      throw new Error("Invalid access token type");
    }

    return decoded;
  }

  /* ===============================
     Refresh Token
  ============================== */

  signRefreshToken(
    payload: Omit<TokenPayload, "type">
  ): { token: string; jti: string } {
    const jti = randomUUID();

    const token = jwt.sign(
      { ...payload, type: "refresh" },
      this.privateKey,
      {
        algorithm: this.config.algorithm,
        issuer: this.config.issuer,
        expiresIn: this.config.refreshExpiresIn,
        jwtid: jti,
      }
    );

    return { token, jti };
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
}) {
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
}