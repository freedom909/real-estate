// user.model.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const Role = { USER: "USER", AGENT: "AGENT", ADMIN: "ADMIN", GUEST: "GUEST", PENDING_AGENT: "PENDING_AGENT" };

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, immutable: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  role: { type: String, enum: Object.values(Role), default: Role.USER, required: true },
  status: { type: String, enum: ["ACTIVE","INACTIVE","BANNED"], default:"ACTIVE" },
}, { timestamps: true });

userSchema.pre("validate", function () { if (!this.userId) this.userId = uuidv4(); });

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;  // ✅ 确保默认导出
