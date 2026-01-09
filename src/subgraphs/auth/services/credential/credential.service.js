import bcrypt from 'bcrypt'
import CredentialRepo from '../../repos/credential.repo.js'

export default class CredentialService {
  constructor() {
    this.repo = new CredentialRepo()
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 12)
  }

  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash)
  }

  // login with password
  async loginWithPassword(email, password) {
    const credential = await this.repo.findPasswordByEmail(email)
    if (!credential) throw new Error('Invalid credentials')
    const ok = await this.verifyPassword(password, credential.passwordHash)
    if (!ok) throw new Error('Invalid credentials')
    return credential.userId
  }

  async registerPassword(userId, email, password) {
    const hash = await this.hashPassword(password)
    return this.repo.createPasswordCredential({ userId, email, passwordHash: hash })
  }

  async findOAuth(provider, providerUserId) {
    return this.repo.findOAuth(provider, providerUserId)
  }

  async registerOAuth(userId, provider, providerUserId) {
    return this.repo.createOAuthCredential({ userId, provider, providerUserId })
  }
}
