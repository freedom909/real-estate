//src/subgraphs/auth/models/refreshToken.model.ts
import { Schema, model, HydratedDocument } from "mongoose";

export interface RefreshTokenMeta {
  sessionId: string;
  familyId: string;
  userId: string;
  issuedAt: Date;
  expiresAt: Date;
}

export interface RefreshToken {
  tokenId: string;
  token: string;
  meta: RefreshTokenMeta;
  status: "active" | "used" | "revoked";
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  rotatedAt?: Date;
}

const refreshTokenSchema = new Schema<RefreshToken>({
  tokenId: { type: String, required: true },
  token: { type: String, required: true },
  meta: {
    sessionId: { type: String, required: true },
    familyId: { type: String, required: true },
    userId: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  status: { 
    type: String, 
    enum: ["active", "used", "revoked"], 
    default: "active" 
  },
  revokedAt: Date,
  rotatedAt: Date,
}, { timestamps: true });

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

const RefreshTokenModel = model<RefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshTokenModel;