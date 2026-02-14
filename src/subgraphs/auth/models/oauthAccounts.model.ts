import { Schema, model, HydratedDocument } from "mongoose"

export interface OAuthAccount {
  userId: string
  provider: string
  providerUserId: string
}

const oauthAccountSchema = new Schema<OAuthAccount>({
  userId: { type: String, required: true },
  provider: { type: String, required: true },
  providerUserId: { type: String, required: true },
})

export type OAuthAccountDocument = HydratedDocument<OAuthAccount>

const OAuthAccountModel = model<OAuthAccount>(
  "OAuthAccount",
  oauthAccountSchema
)

export default OAuthAccountModel
