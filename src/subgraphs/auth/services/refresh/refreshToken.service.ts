// src/subgraphs/auth/services/refresh/refreshToken.service.ts
import { debugRisk, debugToken } from "../../../../shared/debug.js";

interface TokenPayload {
  sub: string;
  familyId: string;
  tokenVersion?: number;
  sessionId: string;
  scope?: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  type: string;
}

interface RefreshTokenContext {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

interface UserRepo {
  getTokenVersion(userId: string): Promise<number>;
}

interface TokenService {
  verifyRefreshToken(token: string): TokenPayload;
  signRefreshToken(payload: any): string;
  signAccessToken(payload: any): string;
}

interface RefreshTokenRepo {
  consume(refreshToken: string): Promise<any>;
  revokeBySession(sessionId: string): Promise<void>;
  save(refreshToken: string, meta: any): Promise<void>;
  delete(refreshToken: string): Promise<void>;
  revokeAllByUser(userId: string): Promise<void>;
}

interface LoginRiskService {
  handleRefreshTokenReuse(params: any): Promise<void>;
}

export default class RefreshTokenService {
  private tokenService: TokenService;
  private refreshTokenRepo: RefreshTokenRepo;
  private loginRiskService: LoginRiskService;
  private userRepo: UserRepo;

  constructor({ tokenService, refreshTokenRepo, loginRiskService, userRepo }: { 
    tokenService: TokenService; 
    refreshTokenRepo: RefreshTokenRepo; 
    loginRiskService: LoginRiskService; 
    userRepo: UserRepo;
  }) {
    if (!tokenService || !refreshTokenRepo || !loginRiskService || !userRepo) {
      throw new Error("RefreshTokenService dependencies missing");
    }

    this.tokenService = tokenService;
    this.refreshTokenRepo = refreshTokenRepo;
    this.loginRiskService = loginRiskService;
    this.userRepo = userRepo;
  }

  /**
   * 🔁 Refresh access token with rotation (Token Family model)
   */
  async refreshAccessToken(refreshToken: string, ctx: RefreshTokenContext): Promise<RefreshTokenResult> {
    const payload: TokenPayload = this.tokenService.verifyRefreshToken(refreshToken);

    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    const { sub: userId, familyId, tokenVersion = 0, sessionId, scope } = payload;

    // tokenVersion 校验
    const currentVersion = await this.userRepo.getTokenVersion(userId);
    if (tokenVersion !== currentVersion) {
      throw new Error("Token revoked");
    }

    // 🔥 原子消费
    const consumed = await this.refreshTokenRepo.consume(refreshToken);

    if (!consumed) {
      await this.refreshTokenRepo.revokeBySession(sessionId);
      await this.loginRiskService.handleRefreshTokenReuse({
        userId,
        familyId,
        ...ctx,
      });
      throw new Error("Refresh token reuse detected");
    }

    // ✅ 继承 familyId（不是 new）
    const newRefreshToken = this.tokenService.signRefreshToken({
      sub: userId,
      tokenVersion,
      familyId,
      deviceId: ctx.deviceId || payload.deviceId,
      ip: ctx.ip || payload.ip,
      userAgent: ctx.userAgent || payload.userAgent,
      sessionId,
      scope,
    });

    await this.refreshTokenRepo.save(newRefreshToken, {
      userId,
      familyId,
      deviceId: ctx.deviceId ?? payload.deviceId,
      ip: ctx.ip ?? payload.ip,
      userAgent: ctx.userAgent ?? payload.userAgent,
      sessionId,
      issuedAt: new Date(),
      ...ctx,
    });

    return {
      accessToken: this.tokenService.signAccessToken({
        sub: userId,
        tokenVersion,
        sessionId,
        scope
      }),
      refreshToken: newRefreshToken,
    };
  }

  /**
   * ❌ Logout (single device)
   */
  async revoke(refreshToken: string): Promise<void> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      await this.refreshTokenRepo.delete(refreshToken);

      debugToken("Refresh token revoked", {
        userId: payload.sub,
        familyId: payload.familyId,
      });
    } catch {
      // idempotent
    }
  }

  /**
   * 🔥 Force logout everywhere
   */
  async revokeAll(userId: string): Promise<void> {
    await this.refreshTokenRepo.revokeAllByUser(userId);
    debugToken("All refresh tokens revoked", { userId });
  }
}