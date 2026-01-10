// src/subgraphs/auth/services/oauth/oauth.service.js

export default class OAuthService {
  constructor({ userClient, credentialRepo }) {
    if (!userClient || !credentialRepo) {
      throw new Error("Missing userClient or credentialRepo");
    }

    this.userClient = userClient;
    this.credentialRepo = credentialRepo;
  }

  async loginWithOAuth({
    provider,
    providerSub,
    email,
    fullname,
    picture,
  }) {
    /**
     * 1️⃣ 查 credential（OAuth 幂等）
     */
    let credential = await this.credentialRepo.findByProvider(
      provider,
      providerSub
    );

    /**
     * 2️⃣ 如果不存在 → 创建 user（通过 User subgraph）
     */
    if (!credential) {
      const user = await this.userClient.findOrCreateOAuthUser({
        email,
        fullname,
        picture,
        provider,
        providerSub,
      });

      credential = await this.credentialRepo.createOAuthCredential({
        userId: user.userId,
        provider,
        providerSub,
      });
    }

    return credential;
  }
}



