// src/subgraphs/auth/services/oauth/oauth.service.js
// ⚠️ MVP VERSION – 能跑优先
export default class OAuthService {
  async verify(provider, idToken) {
    if (!provider) {
      throw new Error("OAuthService.verify: provider is required");
    }
    if (!idToken) {
      throw new Error("OAuthService.verify: idToken is required");
    }

    switch (provider) {
      case "GOOGLE":
        return this.verifyGoogle(idToken);

      case "GITHUB":
        return this.verifyGithub(idToken);

      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  // 🚧 暂时 fake，先跑通流程
  async verifyGoogle(idToken) {
    console.log("🟢 [OAuthService] verifyGoogle called");

    // TODO: 后面再接 Google 官方 SDK
    return {
      provider: "GOOGLE",
      providerUserId: "google-" + idToken.slice(0, 8),
      email: "test@gmail.com",
      name: "Test User",
      avatar: "https://example.com/avatar.png",
    };
  }

  async verifyGithub(idToken) {
    console.log("🟢 [OAuthService] verifyGithub called");

    return {
      provider: "GITHUB",
      providerUserId: "github-" + idToken.slice(0, 8),
      email: "test@github.com",
      name: "Github User",
      avatar: null,
    };
  }
}

