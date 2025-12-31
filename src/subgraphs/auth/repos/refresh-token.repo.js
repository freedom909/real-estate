// src/subgraphs/auth/repos/refresh-token.repo.js
export default class RefreshTokenRepo {
  constructor({ db }) {
    this.db = db;
  }

  async findValid(tokenHash) {
    return this.db.refresh_tokens.findOne({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
    });
  }

  async create(data) {
    return this.db.refresh_tokens.create(data);
  }

  async revoke(id) {
    return this.db.refresh_tokens.update(
      { revokedAt: new Date() },
      { where: { id } }
    );
  }

  async revokeAll(userId) {
    return this.db.refresh_tokens.update(
      { revokedAt: new Date() },
      { where: { userId } }
    );
  }
}
