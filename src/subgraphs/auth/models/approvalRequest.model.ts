// src/subgraphs/auth/models/approvalRequest.model.ts
import mongoose from "mongoose";

interface ApprovalRequest {
  type: "MERGE_ACCOUNT" | "UNBIND_OAUTH" | "FORCE_BIND_OAUTH" | "ROLE_CHANGE";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  requesterUserId: string;
  targetUserId: string;
  payload: object;
  riskScore?: number;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "MERGE_ACCOUNT",
        "UNBIND_OAUTH",
        "FORCE_BIND_OAUTH",
        "ROLE_CHANGE",
      ],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    requesterUserId: {
      type: String,
      required: true,
      index: true,
    },

    targetUserId: {
      type: String,
      required: true,
      index: true,
    },

    payload: {
      type: Object, // merge preview / oauth provider / diff
      required: true,
    },

    riskScore: Number,

    approvedBy: String,
    approvedAt: Date,
    rejectedReason: String,
  },
  { timestamps: true }
);

export default mongoose.model<ApprovalRequest>(
  "ApprovalRequest",
  ApprovalRequestSchema
);