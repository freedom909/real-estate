//src/subgraphs/auth/models/user.model.js
import mongoose from "mongoose";

const OAuthUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    familyId: { type: String, required: true },
    email: { type: String },
    fullname: String,
    picture: String,
    status: {
  type: String,
  enum: ["ACTIVE", "INACTIVE", "BANNED"],
  default: "ACTIVE",
  required: true,
},
    provider: { type: String, required: true },
    providerSub: { type: String, required: true },

    role: { type: String, default: "USER" },
  },
  { timestamps: true }
);

OAuthUserSchema.index({ provider: 1, providerSub: 1 }, { unique: true });

export default mongoose.models.OAuthUser ||
  mongoose.model("OAuthUser", OAuthUserSchema);
