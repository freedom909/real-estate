import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const Role = {
  USER: "USER",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
  GUEST: "GUEST",
};

const identitySchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["GOOGLE", "GITHUB", "APPLE", "LINE", "LOCAL"],
      required: true,
    },
    sub: {
      type: String,
      required: true,
    },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      index: true,
      sparse: true,
    },

    passwordHash: { type: String },

    fullname: { type: String },
    picture: { type: String },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },

    identities: [identitySchema],

    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("validate", function () {
  if (!this.userId) {
    this.userId = uuidv4();
  }

});

const UserModel =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default UserModel;
