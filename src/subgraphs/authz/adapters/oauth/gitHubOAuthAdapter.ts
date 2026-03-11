//src/subgraphs/auth/adapters/oauth/githubOAuthAdapter.ts

import { GithubApi } from "./githubApi";

export class GitHubOAuthAdapter {
  constructor(private deps: { githubApi: GithubApi }) {}

  async parse(accessToken: string) {
    const profile = await this.deps.githubApi.getUserProfile(accessToken);

    return {
      provider: "github",
      providerUserId: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar_url,
    };
  }
}