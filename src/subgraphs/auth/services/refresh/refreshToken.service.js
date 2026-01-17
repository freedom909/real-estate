// src/subgraphs/auth/services/refresh/refreshToken.service.js
import { debugToken, debugRisk } from "../../../../shared/debug.js";

export default class RefreshTokenService {
  constructor({
    tokenService,
    refreshTokenRepo,
    loginRiskService,
  }) {
    this.tokenService = tokenService;
    this.refreshTokenRepo = refreshTokenRepo;
    this.loginRiskService = loginRiskService;
  }

  /**
   * 🔁 Refresh access token with rotation
   */
  async refreshAccessToken(
    oldRefreshToken,
    { ip, userAgent, deviceId } = {}
  ) {
    // 1️⃣ Verify JWT (signature / exp / type)
    let payload;
    try {
      payload =
        this.tokenService.verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      debugRisk("Invalid refresh token", { ip, userAgent });
      throw new Error("Invalid refresh token");
    }

    const userId = payload.sub;
    const tokenId = payload.jti ?? null;

    debugToken("Refresh token verified", {
      userId,
      tokenId,
    });

    // 2️⃣ Check storage (reuse detection)
    const exists =
      await this.refreshTokenRepo.exists(
        userId,
        oldRefreshToken
      );

    if (!exists) {
      debugRisk("Refresh token reuse detected", {
        userId,
        ip,
        userAgent,
        tokenId,
      });

      // 🚨 security response
      await this.refreshTokenRepo.revokeAll(userId);

      await this.loginRiskService.handleRefreshTokenReuse({
        userId,
        ip,
        userAgent,
        tokenId,
      });

      throw new Error(
        "Security incident: refresh token reuse"
      );
    }

    // 3️⃣ Rotate (atomic intent)
    await this.refreshTokenRepo.delete(
      userId,
      oldRefreshToken
    );

    const newAccessToken =
      this.tokenService.generateAccessToken({
        userId,
        role: "USER",
      });

    const newRefreshToken =
      this.tokenService.generateRefreshToken({
        userId,
      });

    await this.refreshTokenRepo.save(
      userId,
      newRefreshToken,
      { deviceId }
    );

    debugToken("Refresh token rotated", {
      userId,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userId,
    };
  }

  /**
   * ❌ Revoke a single refresh token (logout)
   */
  async revoke(refreshToken) {
    try {
      const payload =
        this.tokenService.verifyRefreshToken(refreshToken);

      await this.refreshTokenRepo.delete(
        payload.sub,
        refreshToken
      );

      debugToken("Refresh token revoked", {
        userId: payload.sub,
      });
    } catch {
      // swallow — logout should be idempotent
    }
  }

  /**
   * 🔥 Revoke all refresh tokens of a user
   */
  async revokeAll(userId) {
    await this.refreshTokenRepo.revokeAll(userId);

    debugToken("All refresh tokens revoked", {
      userId,
    });
  }
}
