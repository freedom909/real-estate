//src/subgraphs/tenant/models/tenant.models.ts

import mongoose, { Schema, Document } from "mongoose";

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TenantSchema = new Schema<TenantDocument>(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<TenantDocument>(
  "Tenant",
  TenantSchema
);