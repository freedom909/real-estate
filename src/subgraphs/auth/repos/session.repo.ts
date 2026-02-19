import { Model } from "mongoose";
import { Session, SessionDocument } from "../models/session.model.js";

export default class SessionRepo {
  private SessionModel: Model<SessionDocument>;

  constructor({ SessionModel }: { SessionModel: Model<SessionDocument> }) {
    this.SessionModel = SessionModel;
  }

  async create(data: Session): Promise<SessionDocument> {
    return this.SessionModel.create(data);
  }

  async listByUser(userId: string): Promise<SessionDocument[]> {
    return this.SessionModel.find({
      userId,
      revoked: false,
    }).sort({ lastSeenAt: -1 });
  }

  async revoke(sessionId: string) {
    return this.SessionModel.updateOne(
      { _id: sessionId },
      { $set: { revoked: true } }
    );
  }

  async revokeAll(userId: string) {
    return this.SessionModel.updateMany(
      { userId },
      { $set: { revoked: true } }
    );
  }
}
