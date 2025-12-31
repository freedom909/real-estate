// src/subgraphs/auth/services/refresh/refreshToken.service.js
import { addDays } from "date-fns";


export default class RefreshTokenService {
  constructor({ refreshRepo, tokenService, userService }) {
    this.refreshRepo = refreshRepo;
    this.tokenService = tokenService;
    this.userService = userService;
  }

async rotate(oldToken, meta) {
  const hash = this.tokenService.hashRefreshToken(oldToken);
  const record = await this.refreshRepo.findByHash(hash);

  // ❌ token 不存在 or 已被用过
  if (!record || record.revoked_at) {
    if (record?.user_id) {
      await this.refreshRepo.revokeAllByUserId(record.user_id);
    }

    await this.securityLogRepo.log({
      userId: record?.user_id ?? null,
      type: "REFRESH_TOKEN_REUSE",
      ip: meta.ip,
      ua: meta.userAgent,
    });

    throw new Error("REFRESH_TOKEN_REUSE_DETECTED");
  }

  // ✅ 正常 rotation
  await this.refreshRepo.revoke(record.id);

  const newToken = this.tokenService.generateRefreshToken();
  const newHash = this.tokenService.hashRefreshToken(newToken);

  await this.refreshRepo.create({
    userId: record.user_id,
    tokenHash: newHash,
    expiresAt: addDays(30),
  });

  const user = await this.userService.findById(record.user_id);

  return {
    accessToken: this.tokenService.signAccessToken({
      sub: user.id,
      role: user.role,
    }),
    refreshToken: newToken,
    user,
  };
}

}
