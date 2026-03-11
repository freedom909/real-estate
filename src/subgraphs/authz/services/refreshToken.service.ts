// src/subgraphs/auth/services/refresh/refreshToken.service.ts

import { hash } from "@/utils/hash";
import{ TokenService} from "./token.service";

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

    const tokenHash = hash(refreshToken);

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
      deviceId: ctx.deviceId ,
      ip: ctx.ip ? hash(ctx.ip) : undefined,
      userAgent: ctx.userAgent ? hash(ctx.userAgent) : undefined,
    });

    await this.refreshRepo.save({
      tokenHash,
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