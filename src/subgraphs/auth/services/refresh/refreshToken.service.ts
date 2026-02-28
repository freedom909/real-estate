// src/subgraphs/auth/services/refresh/refreshToken.service.ts

import { hashToken } from "@/utils/hash";
import TokenService from "../token/token.service";

interface RefreshTokenRepo {
  consume(tokenHash: string): Promise<boolean>;
  save(meta: any): Promise<void>;
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
  private refreshRepo: RefreshTokenRepo,
  private userRepo: UserRepo,
  private riskService: LoginRiskService
  ) {}

  async rotate(refreshToken: string, ctx: RefreshContext) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);// is this token.instance.ts?

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

    const tokenHash = hashToken(refreshToken);

    // 2️⃣ 原子消费
    const consumed = await this.refreshRepo.consume(tokenHash);

    if (!consumed) {
      // 🚨 reuse detected
      await this.refreshRepo.revokeBySession(sessionId);

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
      deviceId: ctx.deviceId || payload.deviceId,
      ip: ctx.ip || payload.ip,
      userAgent: ctx.userAgent || payload.userAgent,
    });

    await this.refreshRepo.save({
      tokenHash: hashToken(pair.refreshToken),
      userId,
      familyId,
      sessionId,
      expiresAt: pair.refreshExpiresAt,
      createdAt: new Date(),
    });

    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
    };
  }

  async revokeAll(userId: string) {
    await this.refreshRepo.revokeAllByUser(userId);
  }
}