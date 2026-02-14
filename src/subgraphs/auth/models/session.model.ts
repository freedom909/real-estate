import { Schema, model, HydratedDocument } from "mongoose"

export interface Session {
  userId: string
  familyId: string
  deviceId: string
  userAgent: string
  ip: string
  refreshTokenId: string
  revoked?: boolean
  lastSeenAt?: Date
}

const sessionSchema = new Schema<Session>(
  {
    userId: String,
    familyId: String,
    deviceId: String,
    userAgent: String,
    ip: String,
    refreshTokenId: String,
    revoked: { type: Boolean, default: false },
    lastSeenAt: Date,
  },
  { timestamps: true }
)

export type SessionDocument = HydratedDocument<Session>

export const SessionModel = model<Session>("Session", sessionSchema)

export default SessionModel
