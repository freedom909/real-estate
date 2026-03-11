// src/subgraphs/auth/models/riskEvent.model.ts

import { Schema, model, Types, HydratedDocument } from "mongoose"

export type RiskEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OAUTH_LOGIN"
  | "TOKEN_REFRESH"
  | "PASSWORD_RESET"


// ===============================
// Domain interface
// ===============================

export interface RiskEvent {

  userId: Types.ObjectId

  eventType: RiskEventType

  eventData?: Record<string, any>

  ip?: string

  userAgent?: string

  deviceId?: string

  createdAt: Date

  updatedAt: Date

}


// ===============================
// Document type
// ===============================

export type RiskEventDocument = HydratedDocument<RiskEvent>


// ===============================
// Schema
// ===============================

const riskEventSchema = new Schema<RiskEvent>(
  {

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    eventType: {
      type: String,
      required: true
    },

    eventData: {
      type: Object
    },

    ip: String,

    userAgent: String,

    deviceId: String

  },
  {
    timestamps: true
  }
)

// ===============================
// Model
// ===============================

const RiskEventModel = model<RiskEvent>("RiskEvent", riskEventSchema)

export default RiskEventModel