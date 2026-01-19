

// src/subgraphs/auth/models/refreshToken.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

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

    rotatedAt: Date,
    revokedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);

