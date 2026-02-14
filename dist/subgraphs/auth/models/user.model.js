import { Schema, model } from "mongoose";
const userSchema = new Schema({
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: true },
    name: { type: String },
    avatar: { type: String },
    provider: { type: String },
    providerSub: { type: String },
    tokenVersion: { type: Number, default: 0 }
});
// ✅ 创建正确泛型 Model
const UserModel = model("User", userSchema);
export default UserModel;
