// models/session.model.js
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    familyId: String,
    deviceId: String,
    userAgent: String,
    ip: String,

    refreshTokenId: String, // jti
    revoked: { type: Boolean, default: false },

    lastSeenAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model(
  "Session",
  SessionSchema
);
