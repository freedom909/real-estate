import { OAuthAdapter } from "./oauth.adapter";
import { OAuthProfile } from "../types/oauthProfile";

export default class AppleAdapter implements OAuthAdapter {

  provider = "apple";

  map(idTokenPayload: any): OAuthProfile {

    return {

      provider: "apple",

      providerAccountId: idTokenPayload.sub,

      email: idTokenPayload.email,

      emailVerified: true,

      name: undefined,

      avatar: undefined,

      raw: idTokenPayload

    };

  }

}