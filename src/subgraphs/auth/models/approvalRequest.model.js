// src/subgraphs/auth/models/approvalRequest.model.js
import mongoose from "mongoose";

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

export default mongoose.model(
  "ApprovalRequest",
  ApprovalRequestSchema
);
