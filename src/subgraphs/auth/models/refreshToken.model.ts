// src/subgraphs/auth/models/refreshToken.model.ts
import mongoose from "mongoose";

const { Schema } = mongoose;

export interface RefreshToken {
  tokenId: string;
  userId: mongoose.Types.ObjectId;
  familyId: string;

  tokenHash: string;           // 🔥 必须

  expiresAt: Date;             // 🔥 必须

  replacedBy?: string;        // 🔥 企业级

  deviceId?: string;
  ip?: string;
  userAgent?: string;

  status: "active" | "used" | "revoked";

  issuedAt: Date;
  rotatedAt?: Date;
  revokedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true, // ✅ 只约束 tokenId
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    familyId: {
      type: String,
      required: true,
      index: true,
    },

    deviceId: String,
    ip: String,
    userAgent: String,

    status: {
      type: String,
      enum: ["active", "used", "revoked"],
      default: "active",
      index: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
    tokenHash: {
      type: String,
      required: true,
    },           // 🔥 必须

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },             // 🔥 必须

    replacedBy: {
      type: String,
      index: true,
    },
    rotatedAt: Date,
    revokedAt: Date,
  },
  { timestamps: true },
);

refreshTokenSchema.index(
  { familyId: 1, status: 1 }
);
export default mongoose.model<RefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);