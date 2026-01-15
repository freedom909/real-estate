// src/subgraphs/auth/models/credential.model.js

import mongoose from "mongoose";

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

export default mongoose.model(
  "Credential",
  CredentialSchema
);
