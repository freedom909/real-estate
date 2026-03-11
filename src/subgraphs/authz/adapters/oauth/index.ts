// src/subgraphs/auth/adapters/oauth/index.ts

interface OAuthAdapterInterface {
  parse(idToken: string): Promise<any>;
}

interface OAuthAdapters {
  [key: string]: OAuthAdapterInterface;
}

export default class OAuthAdapter {
  private adapters: OAuthAdapters;

  constructor(adapters: OAuthAdapters) {
    this.adapters = adapters; // { google, github }
  }

  async parse(provider: string, idToken: string) {
    const key = provider.toLowerCase(); // ⭐ 核心
    const adapter = this.adapters[key];

    if (!adapter) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    return adapter.parse(idToken);
  }
}