import { OAuthProfile } from "../types/oauthProfile";

export interface OAuthAdapter {

  provider: string

  map(profile: any): OAuthProfile

}