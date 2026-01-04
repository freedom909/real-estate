// src/subgraphs/auth/services/oauth/oauth.service.js
export default class OAuthService {
  async verifyIdToken(provider, idToken) {
    // verify google / github / facebook
    return {
      provider,  // it is not wrong, the error is not here
      providerUserId: "xxx",
      email: "test@example.com",
    };
  }
}
