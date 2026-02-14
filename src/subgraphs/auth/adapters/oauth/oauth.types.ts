// adapters/oauth/oauth.types.ts
export enum OAuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
}

export interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}