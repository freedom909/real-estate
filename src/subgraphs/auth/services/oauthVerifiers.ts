// src/subgraphs/auth/services/oauthVerifiers.ts

import verifyGoogleIdToken from "./verifiers/google.id";
import verifyGithubIdToken from "./verifiers/github.code";
import verifyAppleIdToken from "./verifiers/apple.code";
import verifyFacebookIdToken from "./verifiers/facebook.code";

interface GoogleIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface GithubIdTokenPayload {
  
  email?: string;
  name?: string;
  avatar?: string;

}

interface AppleIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface FacebookIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export default class OAuthVerifier {
  async verifyIdToken(provider: string, idToken: string): Promise<GoogleIdTokenPayload | GithubIdTokenPayload | AppleIdTokenPayload | FacebookIdTokenPayload> {
    switch (provider) {
      case "GOOGLE":
        return verifyGoogleIdToken(idToken);
      case "GITHUB":
        return verifyGithubIdToken(idToken);
      case "APPLE":
        return verifyAppleIdToken(idToken);
      case "FACEBOOK":
        return verifyFacebookIdToken(idToken);

      default:
        throw new Error("UNSUPPORTED_OAUTH_PROVIDER");
    }
  }
}