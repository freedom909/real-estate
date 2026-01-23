// repos/session.repo.js
export default class SessionRepo {
  constructor({ SessionModel }) {
    this.SessionModel = SessionModel;
  }

  async create(data) {
    return this.SessionModel.create(data);
  }

  async listByUser(userId) {
    return this.SessionModel.find({
      userId,
      revoked: false,
    }).sort({ lastSeenAt: -1 });
  }

  async revoke(sessionId) {
    return this.SessionModel.updateOne(
      { _id: sessionId },
      { $set: { revoked: true } }
    );
  }

  async revokeAll(userId) {
    return this.SessionModel.updateMany(
      { userId },
      { $set: { revoked: true } }
    );
  }
}
