import { OAuthAdapter } from "./oauth.adapter";
import { OAuthProfile } from "../types/oauthProfile";

export default class GithubAdapter implements OAuthAdapter {

  provider = "github";

  map(profile: any): OAuthProfile {

    return {

      provider: "github",

      providerAccountId: String(profile.id),

      email: profile.email ?? undefined,

      name: profile.name ?? profile.login,

      avatar: profile.avatar_url,

      raw: profile

    };

  }

}