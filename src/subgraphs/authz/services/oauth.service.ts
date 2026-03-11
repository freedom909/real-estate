// src/subgraphs/authz/services/oauth.service.ts


import UserClient from "../adapters/user.client"
import OAuthAdapterRegistry from "../OAuthAdapterRegistry"

import OAuthVerifier from "../OAuthVerifier"
import OAuthAccountRepo from "../repos/oauthAccount.repo"
import { TokenService } from "./token.service"

interface OAuthServiceDeps {
  adapterRegistry: OAuthAdapterRegistry
  oauthVerifier: OAuthVerifier

  oauthAccountRepo: OAuthAccountRepo
  userClient: UserClient
  tokenService: TokenService

}

export class OAuthService {
  private adapterRegistry
  private oauthVerifier

  private oauthAccountRepo
  private userClient
  private tokenService


  constructor(deps: OAuthServiceDeps) {

    this.adapterRegistry = deps.adapterRegistry

    this.oauthVerifier = deps.oauthVerifier

    this.oauthAccountRepo = deps.oauthAccountRepo
    this.userClient = deps.userClient
    this.tokenService = deps.tokenService
  }

  async oauthLogin(provider: string, token: string, req: any) {

    // 1 verify token

    const rawProfile = await this.oauthVerifier.verifyIdToken(provider, token);

    // 2 normalize profile
    console.log("rawProfile", rawProfile)
    const adapter = await this.adapterRegistry.get(provider);


    const profile = await adapter.map(rawProfile);


    // 3 find oauth account

    let account =
      await this.oauthAccountRepo.findByProviderAccountId(
        profile.provider,
        profile.providerAccountId
      );
    console.log("account++++++", account)
    let user;

    if (account) {

      user = await this.userClient.findById(account.userId);
      console.log("user++++++", user)//no output
    } else {
      if (profile.email) {
        console.log("checking user by email:", profile.email)
        user = await this.userClient.findByEmail(profile.email);
      }
      if (!user) {
          try {
        user = await this.userClient.createOAuthUser({
          email: profile.email,
          profile: {
            name: profile.name,
            avatar: profile.avatar
          },
      
        }),
          console.log("profile++:", profile),

        await this.oauthAccountRepo.create({ // the 'this.oauthAccountRepo' was removed,what it will  replac it
          userId: user.id,

          provider: profile.provider,

          providerAccountId: profile.providerAccountId
        
        })
       
      }
      catch (err) {
    console.error("createOAuthUser error:", err);
  }
}
       console.log("user.id:", user.id)
      
      return this.tokenService.issueTokenPair({
      
        userId: user.id

      });
     
    }
  }
  async verify(provider: string, token: string) {
    const adapter = this.adapterRegistry.get(provider);
    return adapter.verify(token);
  }
}