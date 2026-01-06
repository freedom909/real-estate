// src/subgraphs/auth/services/refresh/refreshToken.service.js
export default class RefreshTokenService {
  constructor({ refreshRepo }) {
    this.refreshRepo = refreshRepo;
  }

  async save(userId, token) {
    // MVP：先不存数据库
    console.log("💾 save refresh token:", {
      userId,
      token,
    });
  }
}
