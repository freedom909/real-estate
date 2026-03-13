// oauth.adapter.ts

import { NormalizedOAuthProfile } from "../normalized.oauth.profile"

export interface OAuthAdapter {

  provider: string

  map(rawProfile: any): Promise<NormalizedOAuthProfile>

}