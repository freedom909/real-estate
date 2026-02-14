// src/subgraphs/auth/services/credential.service.ts
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import CredentialRepo from '../../repos/credential.repo.js';

interface PasswordCredential {
  userId: string | mongoose.Types.ObjectId;
  passwordHash?: string;
  [key: string]: any;
}

interface OAuthCredential {
  provider: string;
  providerSub: string;
  [key: string]: any;
}

// CredentialRepoのインスタンス型を使用する
export default class CredentialService {
  private repo: InstanceType<typeof CredentialRepo>;

  constructor(credentialRepo: InstanceType<typeof CredentialRepo>) {
    this.repo = credentialRepo; // this should not use new keyword, use DI
  }

  // login with password
  async loginWithPassword(email: string, password: string): Promise<string> {
    const credential: PasswordCredential | null = await this.repo.findPasswordByEmail(email);
    if (!credential || !credential.passwordHash) throw new Error('Invalid credentials');
    const ok: boolean = await this.verifyPassword(password, credential.passwordHash);
    if (!ok) throw new Error('Invalid credentials');
    return credential.userId.toString(); // string に変換して返す
  }

  async findOAuth(provider: string, providerSub: string): Promise<OAuthCredential | null> {
    return this.repo.findOAuth(provider, providerSub);
  }

  async registerOAuth(userId: string, provider: string, providerSub: string): Promise<any> {
    return this.repo.createOAuthCredential({ userId, provider, providerUserId: providerSub });
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}