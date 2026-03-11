import { OAuthAdapter } from "./oauth.adapter";
import { OAuthProfile } from "../types/oauthProfile";

export default class GoogleAdapter implements OAuthAdapter {

  provider = "google";

  map(profile: any): OAuthProfile {

    return {

      provider: "google",

      providerAccountId: profile.sub,

      email: profile.email,

      emailVerified: profile.email_verified,

      name: profile.name,

      avatar: profile.picture,

      raw: profile

    };

  }

}