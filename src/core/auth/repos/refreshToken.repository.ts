// refreshToken.repository.ts
// src/core/auth/repos/refresh/refreshToken.repository.ts

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export default interface RefreshTokenRepository {
  findById(id: string): Promise<RefreshToken | null>;
}