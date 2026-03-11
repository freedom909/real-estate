import mongoose, { Schema, Document, Model } from "mongoose";

export interface IdentityDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  value: string;
  isPrimary: boolean;
  status: string;
}

const IdentitySchema = new Schema<IdentityDocument>({
  userId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  status: { type: String, default: "ACTIVE" },
});

export const IdentityModel: Model<IdentityDocument> =
  mongoose.model<IdentityDocument>("Identity", IdentitySchema);