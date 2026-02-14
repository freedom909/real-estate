// src/subgraphs/auth/models/credential.model.ts

import mongoose from "mongoose";

export interface Credential {
  userId: mongoose.Types.ObjectId;
  provider: "GOOGLE" | "FACEBOOK" | "GITHUB" | "APPLE" | "LINE" | "LOCAL";
  providerSub: string;
  email?: string;
  passwordHash?: string;
  source?: "OAUTH_LOGIN" | "USER_BIND" | "MERGE" | "ADMIN";
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /**
     * OAuth provider
     */
    provider: {
      type: String,
      required: true,
      enum: [
        "GOOGLE",
        "FACEBOOK",
        "GITHUB",
        "APPLE",
        "LINE",
        "LOCAL",
      ],
    },

    /**
     * Provider unique subject (sub)
     */
    providerSub: {
      type: String,
      required: true,
    },

    /**
     * Email returned by provider (snapshot)
     */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
    },

    /**
     * How this credential was created
     */
    source: {
      type: String,
      enum: [
        "OAUTH_LOGIN",
        "USER_BIND",
        "MERGE",
        "ADMIN",
      ],
      default: "OAUTH_LOGIN",
    },

    /**
     * Last successful login time
     */
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * =========================
 * 🔒 Physical Constraints
 * =========================
 */

// One provider account → one credential globally
CredentialSchema.index(
  { provider: 1, providerSub: 1 },
  { unique: true }
);

// One user cannot bind same provider twice
CredentialSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

export default mongoose.model<Credential>(
  "Credential",
  CredentialSchema
);