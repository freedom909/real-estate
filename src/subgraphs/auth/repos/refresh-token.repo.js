// src/subgraphs/auth/repos/refresh-token.repo.js
// src/subgraphs/auth/repos/refreshToken.repo.js

class RefreshTokenRepo {
  constructor() {
    this.tokens = new Map(); // userId -> token
  }

  async save({ userId, token }) {
    this.tokens.set(userId, token);
  }

  async findByUserId(userId) {
    return this.tokens.get(userId);
  }

  async deleteByUserId(userId) {
    this.tokens.delete(userId);
  }
}

export default RefreshTokenRepo;
