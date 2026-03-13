// src/subgraphs/auth/services/refresh/refreshToken.service.ts

import { hash } from "@/utils/hash";
import{ TokenService} from "./token.service";
import { RefreshTokenMeta } from "../models/refreshToken.model.js";

interface RefreshTokenRepo {
  consume(token: string): Promise<any>;
  save(token: string, meta: RefreshTokenMeta & { jti: string; expiresAt: Date }): Promise<void>;
  revokeBySession(sessionId: string): Promise<void>;
  revokeAllByUser(userId: string): Promise<void>;
}

interface UserRepo {
  getTokenVersion(userId: string): Promise<number>;
}

interface LoginRiskService {
  handleRefreshTokenReuse(data: any): Promise<void>;
}

interface RefreshContext {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

export default class RefreshTokenService {
  constructor(
  private tokenService: TokenService,
  private refreshTokenRepository: RefreshTokenRepo,
  private userRepo: UserRepo,
  private riskService: LoginRiskService
  ) {}

  async rotate(refreshToken: string, ctx: RefreshContext) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const {
      sub: userId,
      tokenVersion,
      familyId,
      sessionId,
    } = payload;

    // 1️⃣ tokenVersion 校验
    const currentVersion = await this.userRepo.getTokenVersion(userId);
    if (currentVersion !== tokenVersion) {
      throw new Error("Token revoked globally");
    }

    // 2️⃣ 原子消费
    const consumed = await this.refreshTokenRepository.consume(refreshToken);

    if (!consumed) {
      // 🚨 reuse detected
      await this.refreshTokenRepository.revokeBySession(sessionId);

      await this.riskService.handleRefreshTokenReuse({
        userId,
        familyId,
        sessionId,
        ...ctx,
      });

      throw new Error("Refresh token reuse detected");
    }

    // 3️⃣ 发行新 token
    const pair = this.tokenService.issueTokenPair({
      userId,
      tokenVersion,
      familyId,
      sessionId,
      deviceId: ctx.deviceId ,
      ip: ctx.ip ? hash(ctx.ip) : undefined,
      userAgent: ctx.userAgent ? hash(ctx.userAgent) : undefined,
    });
    await this.refreshTokenRepository.save(pair.refreshToken, {
      userId,
      familyId,
      sessionId,
      issuedAt: new Date(),
      expiresAt: pair.refreshExpiresAt,
      jti: pair.refreshJti,
    });

    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
    };
  }

  async revokeAll(userId: string) {
    await this.refreshTokenRepository.revokeAllByUser(userId);
  }
}