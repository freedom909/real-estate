// src/subgraphs/user/models/user.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const Role = {
  USER: "USER",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
  GUEST: "GUEST",
  PENDING_AGENT: "PENDING_AGENT",
};

const userSchema = new mongoose.Schema(
  {
    // ===== Core identity =====
    userId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BANNED"],
      default: "ACTIVE",
      required: true,
    },


    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false, // 默认不返回
    },

    fullname: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    picture: { type: String },

    // ===== OAuth fields =====
    provider: {
      type: String, // google / apple / github / line / local
      index: true,
    },

    providerSub: {
      type: String,
      index: true,
    },

    // ===== Role & status =====
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
      required: true,
    },

    agentStatus: {
      type: String,
      enum: ["NOT_APPLIED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_APPLIED",
    },

    kycVerified: {
      type: Boolean,
      default: false,
    },

    version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//
// 🔐 企业级关键索引（OAuth 幂等）
//
userSchema.index(
  { provider: 1, providerSub: 1 },
  {
    unique: true,
    sparse: true, // 允许 local 用户
  }
);


//
// 🔐 Email 唯一（可选，推荐）
//
userSchema.index(

  {
    unique: true,
    sparse: true,
  }
);

//
// 🔧 自动生成 userId
//
userSchema.pre("validate", function () {
  if (!this.userId) {
    this.userId = uuidv4();
  }
});

const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
