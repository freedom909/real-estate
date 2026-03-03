// src/subgraphs/auth/services/oauth/oauthVerifier.ts
import verifyGoogleIdToken from "./verifiers/google.id";

interface OAuthProfile {
  providerUserId: string;
  email?: string;
  [key: string]: any;
}

interface GoogleIdTokenPayload {
  sub: string;
  email?: string;
  [key: string]: any;
}

export default class OAuthVerifier {
  async verifyIdToken(provider: string, idToken: string): Promise<GoogleIdTokenPayload> {
    switch (provider) {
      case "GOOGLE":
        return verifyGoogleIdToken(idToken);
      default:
        throw new Error("UNSUPPORTED_OAUTH_PROVIDER");
    }
  }

  async verify(provider: string, idToken: string): Promise<OAuthProfile> {
    const res = await this.verifyIdToken(provider, idToken);
    return {
      providerUserId: res.sub,
      email: res.email,
    };
  }
}