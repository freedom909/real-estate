import { OAuthProviderAdapter } from "./oauthProviderAdapter";

export class OAuthAdapter {
  private adapters: Record<string, OAuthProviderAdapter>;

  constructor(adapters: Record<string, OAuthProviderAdapter>) {
    this.adapters = adapters;
  }

  async parse(provider: string, idToken: string) {
    const adapter = this.adapters[provider];

    if (!adapter) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    return adapter.parse(idToken);
  }
}