import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },

    ip: String,
    userAgent: String,

    revoked: { type: Boolean, default: false },
    revokedAt: Date,
    replacedByTokenId: String,

    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
