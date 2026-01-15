import bcrypt from 'bcrypt'
import CredentialRepo from '../../repos/credential.repo.js'

export default class CredentialService {
  constructor(credentialRepo) {
    this.repo = credentialRepo// this should not use new keyword, use DI
  }

  // login with password
  async loginWithPassword(email, password) {
    const credential = await this.repo.findPasswordByEmail(email)
    if (!credential) throw new Error('Invalid credentials')
    const ok = await this.verifyPassword(password, credential.passwordHash)
    if (!ok) throw new Error('Invalid credentials')
    return credential.userId
  }

  async findOAuth(provider, providerUserId) {
    return this.repo.findOAuth(provider, providerUserId)
  }

  async registerOAuth(userId, provider, providerUserId) {
    return this.repo.createOAuthCredential({ userId, provider, providerUserId })
  }
}
