import Credential from "../credentials/Credential.js";
// import Credential from '../models/credential.model.js'

export default class CredentialRepo {
async findPasswordByEmail(email) {
    return db.credential.findOne({
      where: {
        type: "password",
        email,
      },
    });
  }

  async createPasswordCredential({ userId, email, passwordHash }) {
    return db.credential.create({
      data: {
        userId,
        type: "password",
        email,
        passwordHash,
      },
    });
  }

  async findPasswordByEmail(email) {
    return Credential.findOne({ type: 'password', email })
  }

  async findOAuth(provider, providerUserId) {
    return Credential.findOne({ type: 'oauth', provider, providerUserId })
  }

  async createPasswordCredential({ userId, email, passwordHash }) {
    return Credential.create({ userId, type: 'password', email, passwordHash })
  }

  async createOAuthCredential({ userId, provider, providerUserId }) {
    return Credential.create({ userId, type: 'oauth', provider, providerUserId })
  }

  findByProvider(provider, providerUserId) {
    return Credential.findOne({ provider, providerUserId });
  }

  updateLastLogin(id) {
    return Credential.findByIdAndUpdate(id, {
      lastLoginAt: new Date(),
    });
  }

  create(data) {
    return Credential.create({
      ...data,
      lastLoginAt: new Date(),
    });
  }
}
