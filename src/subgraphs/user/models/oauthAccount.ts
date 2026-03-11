// src/subgraphs/user/models/oauthAccount.ts
import mongoose, { Types } from "mongoose";

export interface IOAuthAccountDB {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  provider: string;
  providerSub: string;
}

const oauthAccountSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
  userId: { type: Types.ObjectId, ref: "User", required: true },
  provider: { type: String, required: true },
  providerSub: { type: String, required: true },
}, { timestamps: true });

const OAuthAccountModel = mongoose.models.OAuthAccount || mongoose.model<IOAuthAccountDB>("OAuthAccount", oauthAccountSchema);
export default OAuthAccountModel;  // ✅ 确保默认导出
// 索引：确保每个用户只能有一个 OAuth 账号 per provider
oauthAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });