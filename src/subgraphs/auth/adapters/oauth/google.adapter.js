// adapters/oauth/google.adapter.js
import { OAuth2Client } from "google-auth-library";
import { OAuthProvider } from "./oauth.types.js";

export default class GoogleOAuthAdapter {
  constructor({ clientId }) {
    this.client = new OAuth2Client(clientId);
  }

  async parse(idToken) {
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
