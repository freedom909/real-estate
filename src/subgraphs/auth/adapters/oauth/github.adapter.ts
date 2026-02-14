// adapters/oauth/github.adapter.ts
import { OAuthProvider } from "./oauth.types.js";

interface GitHubProfile {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface GitHubApi {
  getProfile(accessToken: string): Promise<GitHubProfile>;
}

interface GitHubOAuthAdapterConstructorParams {
  githubApi: GitHubApi;
}

interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export default class GitHubOAuthAdapter {
  private githubApi: GitHubApi;

  constructor({ githubApi }: GitHubOAuthAdapterConstructorParams) {
    this.githubApi = githubApi;
  }

  async parse(accessToken: string): Promise<OAuthProfile> {
    const profile = await this.githubApi.getProfile(accessToken);

    if (!profile?.id) {
      throw new Error("Invalid GitHub access token");
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