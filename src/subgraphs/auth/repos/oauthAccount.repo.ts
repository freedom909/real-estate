import { Model } from "mongoose"
import OAuthAccountModel, {
  OAuthAccount,
  OAuthAccountDocument
} from "../models/oauthAccounts.model.js"

export default class OAuthAccountRepo {
  private model: Model<OAuthAccount>

  constructor({ model }: { model: Model<OAuthAccount> }) {
    if (!model) {
      throw new Error("OAuthAccountRepo: model is required")
    }
    this.model = model
  }

  async findByProviderUserId(
    provider: string,
    providerUserId: string
  ): Promise<OAuthAccountDocument | null> {
    return this.model
      .findOne({ provider, providerUserId })
      .exec()
  }

  async findByUserId(userId: string): Promise<OAuthAccountDocument[]> {
    return this.model
      .find({ userId })
      .exec()
  }

  async create({
    userId,
    provider,
    providerUserId
  }: OAuthAccount): Promise<OAuthAccountDocument> {

    return this.model.create({
      userId,
      provider,
      providerUserId
    })
  }

  async deleteByProvider({
    userId,
    provider
  }: {
    userId: string
    provider: string
  }) {
    return this.model.deleteOne({
      userId,
      provider
    })
  }

  async exists(
    provider: string,
    providerUserId: string
  ): Promise<boolean> {
    const count = await this.model.countDocuments({
      provider,
      providerUserId
    })

    return count > 0
  }
}
