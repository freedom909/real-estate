//src/subgraphs/auth/adapters/oauth/githubApi.ts

export class GithubApi {
  constructor(private config: {
    clientId: string;
    clientSecret: string;
  }) {}

  async getUserProfile(accessToken: string) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user");
    }

    return response.json();
  }
}