import GoogleAdapter from "./adapters/google.adapter.js";
import GithubAdapter from "./adapters/github.adapter.js";
import AppleAdapter from "./adapters/apple.adapter.js";
import { OAuthAdapter } from "./adapters/oauth.adapter.js";

export default class OAuthAdapterRegistry {

  private adapters = new Map<string, OAuthAdapter>();

  constructor() {

    this.register(new GoogleAdapter());
    this.register(new GithubAdapter());
    this.register(new AppleAdapter());

  }

  register(adapter: OAuthAdapter) {

    this.adapters.set(adapter.provider, adapter);

  }

  get(provider: string): OAuthAdapter {
    
    const adapter = this.adapters.get(provider);
    console.log("adapter+++++", adapter)
    if (!adapter) {
      throw new Error(`OAuth adapter not found: ${provider}`);
    }

    return adapter;

  }

}