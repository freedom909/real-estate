// src/subgraphs/auth/adapters/oauth/index.ts
export default class OAuthAdapter {
    constructor(adapters) {
        this.adapters = adapters; // { google, github }
    }
    async parse(provider, idToken) {
        const key = provider.toLowerCase(); // ⭐ 核心
        const adapter = this.adapters[key];
        if (!adapter) {
            throw new Error(`Unsupported OAuth provider: ${provider}`);
        }
        return adapter.parse(idToken);
    }
}
