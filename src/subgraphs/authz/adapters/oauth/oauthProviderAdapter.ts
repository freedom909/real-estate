// adapters/oauth/oauthProviderAdapter.ts
import { OAuthProfile } from "./oauth.types";

export interface OAuthProviderAdapter {
  parse(idToken: string): Promise<OAuthProfile>;
}