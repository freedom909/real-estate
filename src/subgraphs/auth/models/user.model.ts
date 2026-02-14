import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true },
  emailVerified: { type: Boolean, default: true },
  name: { type: String },
  avatar: { type: String },
  provider: { type: String },
  providerSub: { type: String },
  tokenVersion: { type: Number, default: 0 }
});

// ✅ 推断 schema 类型
export type User = InferSchemaType<typeof userSchema>;

// ✅ 创建正确泛型 Model
const UserModel = model<User>("User", userSchema);

export default UserModel;
