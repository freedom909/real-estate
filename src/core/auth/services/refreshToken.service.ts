// refreshToken.service.ts
// src/core/auth/services/refresh/refreshToken.service.ts
import RefreshTokenRepository from '../repos/refreshToken.repository.js';

export default class RefreshTokenService {
  private refreshTokenRepository: RefreshTokenRepository;
  constructor(refreshTokenRepository: RefreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }
}