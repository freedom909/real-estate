// src/subgraphs/auth/repositories/oauthAccount.repo.js
import OAuthAccountModel from "../models/oauthAccounts.model.js";
export default class OAuthAccountRepo {
  constructor({ model }) {
    if (!model) {
      throw new Error("OAuthAccountRepo: model is required");
    }
    this.model = model;
  }


  /* =========================
     Queries
  ========================= */

  async findByProviderUserId(provider, providerUserId) {
    if (!provider || !providerUserId) return null;

    return this.model.findOne({
      provider,
      providerUserId,
    });
  }

  async findByUserId(userId) {
    if (!userId) return [];

    return this.model.find({ userId });
  }

  /* =========================
     Mutations
  ========================= */

  async create({ userId, provider, providerUserId }) {
    if (!userId || !provider || !providerUserId) {
      throw new Error(
        "OAuthAccountRepo.create: userId, provider, providerUserId are required"
      );
    }

    return this.model.create({
      userId,
      provider,
      providerUserId,
    });
  }

  async deleteByProvider({ userId, provider }) {
    if (!userId || !provider) {
      throw new Error(
        "OAuthAccountRepo.deleteByProvider: userId and provider are required"
      );
    }

    return this.model.deleteOne({
      userId,
      provider,
    });
  }

  async exists(provider, providerUserId) {
    if (!provider || !providerUserId) return false;

    const count = await this.model.countDocuments({
      provider,
      providerUserId,
    });

    return count > 0;
  }
}
