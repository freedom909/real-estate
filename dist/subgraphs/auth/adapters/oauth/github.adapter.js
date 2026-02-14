// adapters/oauth/github.adapter.ts
import { OAuthProvider } from "./oauth.types.js";
export default class GitHubOAuthAdapter {
    constructor({ githubApi }) {
        this.githubApi = githubApi;
    }
    async parse(accessToken) {
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
