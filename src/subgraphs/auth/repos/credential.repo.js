// src/subgraphs/auth/repos/credential.repo.js
import bcrypt from "bcrypt";

export default class CredentialRepo {
  constructor({ credentialModel }) {
    if (!credentialModel) {
      throw new Error("Missing credentialModel");
    }
    this.credentialModel = credentialModel;
  }

  // =====================
  // PASSWORD
  // =====================

  async findPasswordByEmail(email, userClient) {
    const user = await userClient.findByEmail(email);
    if (!user) return null;

    return this.credentialModel
      .findOne({
        userId: user.id,
        type: "PASSWORD",
        provider: "LOCAL",
      })
      .select("+passwordHash");
  }

  async verifyPassword(credential, password) {
    return bcrypt.compare(password, credential.passwordHash);
  }

  async createPassword({ userId, password }) {
    const passwordHash = await bcrypt.hash(password, 12);

    return this.credentialModel.create({
      userId,
      type: "PASSWORD",
      provider: "LOCAL",
      passwordHash,
    });
  }

  // =====================
  // OAUTH
  // =====================

  async findByProvider(provider, providerSub) {
    return this.credentialModel.findOne({
      provider,
      providerSub,
      type: "OAUTH",
    });
  }

  async createOAuth({ userId, provider, providerSub }) {
    return this.credentialModel.create({
      userId,
      type: "OAUTH",
      provider,
      providerSub,
    });
  }

  // =====================
  // COMMON
  // =====================

  async updateLastLogin(id) {
    return this.credentialModel.findByIdAndUpdate(id, {
      lastLoginAt: new Date(),
    });
  }
  
}
