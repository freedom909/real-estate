// adapters/github.adapter.ts

import { OAuthAdapter } from "../oauth/oauth.adapter"
import { NormalizedOAuthProfile } from "../normalized.oauth.profile"
import { OAuthProvider } from "../oauth/oauth.provider"

 class GithubOAuthAdapter implements OAuthAdapter {

  provider = OAuthProvider.GITHUB

  async map(raw: any): Promise<NormalizedOAuthProfile> {

    return {

      provider: this.provider,

      providerAccountId: raw.id.toString(),

      email: raw.email,

      name: raw.login,

      avatar: raw.avatar_url,
      sub: raw.id.toString()

    }

  }

}
export default GithubOAuthAdapter