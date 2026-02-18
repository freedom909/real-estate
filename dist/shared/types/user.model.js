// user.model.ts
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Role } from "./role";
const userSchema = new mongoose.Schema({
    profile: {
        UserId: { type: String, required: true, unique: true, immutable: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        name: { type: String },
        avatar: { type: String },
    },
    role: { type: String, enum: Object.values(Role), default: Role.CUSTOMER, required: true }, // default should be 'Customer' ?
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "BANNED"], default: "ACTIVE" },
    tokenVersion: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });
// ユーザーIDを生成する前に、profile.UserId が存在するか確認
userSchema.pre("validate", function (next) {
    if (!this.profile.UserId) {
        this.profile.UserId = uuidv4();
    }
    if (typeof next === 'function')
        next();
});
const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel; // ✅ 确保默认导出
