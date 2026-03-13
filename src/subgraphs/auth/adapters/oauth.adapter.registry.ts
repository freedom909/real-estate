// oauth.adapter.registry.ts


import { OAuthAdapter } from "./oauth/oauth.adapter"
import { OAuthProvider } from "./oauth/oauth.provider"
import { GoogleOAuthAdapter } from "./3rdLogin/google.adapter";
import { OAuthProfile } from "./oauth/oauth.profile";
import { injectable } from "tsyringe";

@injectable()
export class OAuthAdapterRegistry {
  private adapters = new Map<OAuthProvider, OAuthAdapter>();

  constructor(
    googleAdapter: GoogleOAuthAdapter,
  ) {
    this.adapters.set(OAuthProvider.GOOGLE, googleAdapter);
  }

  get(provider: OAuthProvider) {
    const adapter = this.adapters.get(provider.toLowerCase() as OAuthProvider);

    if (!adapter) {
      throw new Error(`OAuth adapter not found: ${provider}`);
    }

    return adapter;
  }

    register(adapter: OAuthAdapter) {

    this.adapters.set(adapter.provider as OAuthProvider, adapter);

  }
  
}
export default OAuthAdapterRegistry;