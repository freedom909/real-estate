// src/subgraphs/auth/services/oauth/oauth.service.js
import verifyGoogleIdToken from "./verifiers/google.id.js";
export default class OAuthService {
   constructor({ userClient, credentialRepo, oauthVerifier }) {
    this.userClient = userClient;
    this.credentialRepo = credentialRepo;
    this.oauthVerifier = oauthVerifier;
  }
  // src/subgraphs/auth/services/oauth/oauth.service.js

  async verifyIdToken(provider, idToken) {
    switch (provider) {
      case "GOOGLE":
        return verifyGoogleIdToken(idToken);
      case "FACEBOOK":
        return verifyFacebookIdToken(idToken);
      case "LINE":
        return verifyLineIdToken(idToken);
      case "GITHUB":
        return verifyGithubIdToken(idToken);
      case "APPLE":
        return verifyAppleIdToken(idToken);
      default:
        throw new Error("UNSUPPORTED_OAUTH_PROVIDER");
    }
  }
}


