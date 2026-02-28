// adapters/oauth/github.adapter.ts
import { OAuthProvider } from "./oauth.types";
import { OAuthProviderAdapter } from "./oauthProviderAdapter";

interface GithubProfile {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface GithubApi {
  getProfile(accessToken: string): Promise<GithubProfile>;
}

interface GithubOAuthAdapterConstructorParams {
  githubApi: GithubApi;
}

interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export default class GithubOAuthAdapter implements OAuthProviderAdapter{
  private githubApi: GithubApi;

  constructor({ githubApi }: GithubOAuthAdapterConstructorParams) {
    this.githubApi = githubApi;
  }

  async parse(idToken: string): Promise<OAuthProfile> {
    const profile = await this.githubApi.getProfile(idToken);

    if (!profile?.id) {
      throw new Error("Invalid Github id token");
    }

    return {
      provider: OAuthProvider.GITHUB,
      providerUserId: String(profile.id),
      email: profile.email,
      name: profile.name || profile.login,
      avatar: profile.avatar_url,
    };
  }
}