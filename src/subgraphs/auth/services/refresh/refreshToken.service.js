// src/subgraphs/auth/services/refresh/refreshToken.service.js
import { randomUUID } from "crypto";
import { debugRisk, debugToken } from "../../../../shared/debug.js";

export default class RefreshTokenService {
  constructor({ tokenService, refreshTokenRepo, loginRiskService, userRepo }) {
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
 async refreshAccessToken(refreshToken, ctx) {
  const payload = this.tokenService.verifyRefreshToken(refreshToken);

  if (payload.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  const { sub: userId, familyId, tokenVersion } = payload;

  // tokenVersion 校验
  const currentVersion = await this.userRepo.getTokenVersion(userId);
  if (tokenVersion !== currentVersion) {
    throw new Error("Token revoked");
  }

  // 🔥 原子消费
  const consumed = await this.refreshTokenRepo.consume(refreshToken);

  if (!consumed) {
    await this.refreshTokenRepo.revokeFamily(familyId);
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
    deviceId: payload.deviceId,
    ip: payload.ip,
    userAgent: payload.userAgent,
  });

  await this.refreshTokenRepo.save(newRefreshToken, {
    userId,
    familyId,
    deviceId: payload.deviceId,
    ip: payload.ip,
    userAgent: payload.userAgent,
    ...ctx,
  });

  return {
    accessToken: this.tokenService.signAccessToken({
      userId,
      tokenVersion,
    }),
    refreshToken: newRefreshToken,
  };
}


  /**
   * ❌ Logout (single device)
   */
  async revoke(refreshToken) {
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
  async revokeAll(userId) {
    await this.refreshTokenRepo.revokeAllByUser(userId);
    debugToken("All refresh tokens revoked", { userId });
  }
}
