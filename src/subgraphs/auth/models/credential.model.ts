// src/subgraphs/auth/models/credential.model.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface CredentialDocument extends Document {
  id: string
  userId: string
  provider: string
  providerSub?: string
}

const CredentialSchema = new Schema<CredentialDocument>({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  provider: { type: String, required: true },
  providerSub: { type: String, required: false },
});

export const CredentialModel: Model<CredentialDocument> =
  mongoose.model<CredentialDocument>("Credential", CredentialSchema);
export default CredentialModel