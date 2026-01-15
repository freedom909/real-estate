import mongoose from "mongoose";

const OAuthAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    provider: {
      type: String,
      required: true,
      index: true,
    },

    providerUserId: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ⭐ 关键：唯一索引，防止重复绑定
OAuthAccountSchema.index(
  { provider: 1, providerUserId: 1 },
  { unique: true }
);

const OAuthAccountModel =
  mongoose.models.OAuthAccount ||
  mongoose.model("OAuthAccount", OAuthAccountSchema);

export default OAuthAccountModel;
