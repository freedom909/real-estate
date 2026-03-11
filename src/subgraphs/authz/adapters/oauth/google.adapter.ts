// adapters/oauth/google.adapter.ts
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { OAuthProvider } from "./oauth.types";
import { OAuthProviderAdapter } from "./oauthProviderAdapter";
import { OAuthProfile } from "./oauth.types";
interface GoogleOAuthAdapterConstructorParams {
  clientId: string;
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
    console.log("ticket++", ticket)

    const payload = ticket.getPayload();

    if (!payload?.sub) {
      throw new Error("Invalid Google ID token");
    }

    return {
      provider: OAuthProvider.GOOGLE,
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };
  }
}