//src/subgraphs/models/membership.model.ts

import mongoose, { Schema, Document } from "mongoose";

export type MembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface MembershipDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  role: MembershipRole;
  createdAt: Date;
}

const MembershipSchema = new Schema<MembershipDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      default: "MEMBER",
    },
  },
  {
    timestamps: true,
  }
);

// 防止重复 membership
MembershipSchema.index(
  { userId: 1, tenantId: 1 },
  { unique: true }
);

export default mongoose.model<MembershipDocument>(
  "Membership",
  MembershipSchema
);