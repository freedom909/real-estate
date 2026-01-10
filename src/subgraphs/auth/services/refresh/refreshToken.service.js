// src/subgraphs/auth/services/refresh/refreshToken.service.js
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { debugToken, debugRisk } from "../../../../shared/debug.js";

const PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "src/keys/public.pem"),
  "utf8"
);


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

  async save(userId, refreshToken, { deviceId } = {}) {
    await this.refreshTokenRepo.save(
      userId,
      refreshToken,
      { deviceId }
    );

    debugToken("Refresh token saved", {
      userId,
      deviceId,
    });
  }

  async refreshAccessToken(
    oldRefreshToken,
    { ip, userAgent } = {}
  ) {
    // 1️⃣ JWT 验证（交给 TokenService）
    const payload =
      this.tokenService.verifyRefreshToken(
        oldRefreshToken
      );

    debugToken("Refresh token verified", payload);

    const userId = payload.sub;

    // 2️⃣ Redis / DB 检查
    const exists = await this.refreshTokenRepo.exists(
      userId,
      oldRefreshToken
    );

    if (!exists) {
      debugRisk("Refresh token reuse detected", {
        userId,
        ip,
        userAgent,
      });

      await this.loginRiskService.handleRefreshTokenReuse({
        userId,
        ip,
        userAgent,
        refreshTokenId: payload.jti ?? null,
      });

      await this.refreshTokenRepo.revokeAll(userId);

      throw new Error(
        "Security incident: refresh token reuse"
      );
    }

    // 3️⃣ rotation
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
      newRefreshToken
    );

    debugToken("Refresh token rotated", {
      userId,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: userId },
    };
  }

  async issue({ userId, ip, userAgent }) {
      console.log("🟢 [RT] issue", { userId, ip, userAgent });
    const tokenId = uuidv4();

    const refreshToken = this.tokenService.signRefreshToken({
      sub: userId,
      jti: tokenId,
    }); 
    await this.repo.create({
      tokenId,
      userId,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });

    return refreshToken;
  }

  async rotate({ refreshToken, ip, userAgent }) {
    console.log("🟢 [RT] rotate", { refreshToken, ip, userAgent });
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    console.log("🔍 [RT] payload", payload);
    const tokenId = payload.jti;
    const userId = payload.sub;

    const stored = await this.repo.findByTokenId(tokenId);
    if (!stored || stored.revoked) {
      throw new Error("Refresh token revoked");
    }

    // 🚨 Risk detection
    if (
      this.risk.isRisky({
        oldIp: stored.ip,
        newIp: ip,
        oldUA: stored.userAgent,
        newUA: userAgent,
      })
    ) {
      await this.repo.revokeAllByUser(userId);
      throw new Error("Suspicious refresh detected");
    }

    // 🔁 Rotation
    const newTokenId = uuidv4();

    await this.repo.revoke(tokenId, newTokenId);

    const newRefreshToken = this.tokenService.signRefreshToken({
      sub: userId,
      jti: newTokenId,
    });

    await this.repo.create({
      tokenId: newTokenId,
      userId,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });
  console.log("🔁 [RT] old token revoked:", tokenId);
  console.log("🆕 [RT] new token issued:", newTokenId);
    return newRefreshToken;
  }
}

