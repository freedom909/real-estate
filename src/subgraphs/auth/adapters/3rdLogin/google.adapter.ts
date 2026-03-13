// adapters/google.adapter.ts

import { OAuthAdapter } from "../oauth/oauth.adapter"
import { NormalizedOAuthProfile } from "../normalized.oauth.profile"
import { OAuthProvider } from "../oauth/oauth.provider"
import { injectable } from "tsyringe"
@injectable()
export class GoogleOAuthAdapter implements OAuthAdapter {

  provider = OAuthProvider.GOOGLE

  async map(raw: any): Promise<NormalizedOAuthProfile> {

    return {

      provider: this.provider,

      providerAccountId: raw.sub,

      email: raw.email,

      emailVerified: raw.email_verified,

      name: raw.name,

      avatar: raw.picture,
      sub: raw.sub

    

    }

  }

}