// adapters/oauth/google.adapter.ts
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { OAuthProvider } from "./oauth.types";
import { OAuthProviderAdapter } from "./oauthProviderAdapter";

interface GoogleOAuthAdapterConstructorParams {
  clientId: string;
}

interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export default class GoogleOAuthAdapter implements OAuthProviderAdapter{
  private client: OAuth2Client;

  constructor({ clientId }: GoogleOAuthAdapterConstructorParams) {
    this.client = new OAuth2Client(clientId);
  }

  async parse(idToken: string): Promise<OAuthProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.client._clientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub) {
      throw new Error("Invalid Google ID token");
    }

    return {
      provider: OAuthProvider.GOOGLE,
      providerUserId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };
  }
}