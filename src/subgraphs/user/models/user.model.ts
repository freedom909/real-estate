// user.model.ts
import mongoose, { HydratedDocument, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export enum Role { 
  USER = "USER", 
  AGENT = "AGENT", 
  ADMIN = "ADMIN", 
  GUEST = "GUEST", 
  PENDING_AGENT = "PENDING_AGENT" 
}
export  interface IProfile {
  UserId: string;
  email: string;
  name: string;
  avatar: string;
}
export type UserDocument = HydratedDocument<IUser>;
export interface IUser {
  _id: Types.ObjectId;  
  __v: number;
  profile: IProfile;
  role: Role;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  profile: {
    UserId: { type: String, required: true, unique: true, immutable: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String },
    avatar: { type: String },
  },
  role: { type: String, enum: Object.values(Role), default: Role.USER, required: true },
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
  if (typeof next === 'function') next();
});

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default UserModel;  // ✅ 确保默认导出