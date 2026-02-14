// src/subgraphs/auth/services/credential.service.ts
import bcrypt from 'bcrypt';
// CredentialRepoのインスタンス型を使用する
export default class CredentialService {
    constructor(credentialRepo) {
        this.repo = credentialRepo; // this should not use new keyword, use DI
    }
    // login with password
    async loginWithPassword(email, password) {
        const credential = await this.repo.findPasswordByEmail(email);
        if (!credential || !credential.passwordHash)
            throw new Error('Invalid credentials');
        const ok = await this.verifyPassword(password, credential.passwordHash);
        if (!ok)
            throw new Error('Invalid credentials');
        return credential.userId.toString(); // string に変換して返す
    }
    async findOAuth(provider, providerSub) {
        return this.repo.findOAuth(provider, providerSub);
    }
    async registerOAuth(userId, provider, providerSub) {
        return this.repo.createOAuthCredential({ userId, provider, providerUserId: providerSub });
    }
    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
