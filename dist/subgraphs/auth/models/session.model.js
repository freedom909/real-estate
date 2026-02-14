import { Schema, model } from "mongoose";
const sessionSchema = new Schema({
    userId: String,
    familyId: String,
    deviceId: String,
    userAgent: String,
    ip: String,
    refreshTokenId: String,
    revoked: { type: Boolean, default: false },
    lastSeenAt: Date,
}, { timestamps: true });
export const SessionModel = model("Session", sessionSchema);
export default SessionModel;
