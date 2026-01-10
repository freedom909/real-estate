// src/subgraphs/auth/models/credential.model.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const credentialSchema = new mongoose.Schema(
  {
    credentialId: {
      type: String,
      default: uuidv4,
      immutable: true,
      unique: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["PASSWORD", "OAUTH"],
      required: true,
    },

    provider: {
      type: String, // local / google / github / apple
      required: true,
      index: true,
    },

    providerSub: {
      type: String,
      index: true,
      sparse: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    verified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔐 OAuth 幂等唯一
credentialSchema.index( 
  { provider: 1, providerSub: 1 },
  { unique: true, sparse: true }
);

// 🔐 password 唯一（一个 user 只能一个 local）
credentialSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

export default mongoose.models.Credential ||
  mongoose.model("Credential", credentialSchema);
