// src/subgraphs/auth/services/refresh/refreshToken.service.js
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { debugToken, debugRisk} from "../../../../shared/debug.js";

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
}

