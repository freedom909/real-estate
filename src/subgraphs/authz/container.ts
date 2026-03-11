// src/subgraphs/authz/container/auth.container.ts

import { DependencyContainer } from "tsyringe"
import { TOKENS } from "../../shared/container/tokens"

// infra
import { createRedis } from "@/infrastructure/redis/redis"

// models

import RefreshTokenModel from "./models/refreshToken.model"
import OAuthAccountModel from "./models/oauthAccount.model"
import SessionModel from "./models/session.model"
import RiskEventModel from "./models/riskEvent.model"

// repos
import CredentialRepo from "../user/repos/credential.repo"
import RefreshTokenRepo from "./repos/refresh-token.repo"
import OAuthAccountRepo from "./repos/oauthAccount.repo"
import RiskEventRepo from "./repos/riskEvent.repo"
import SessionRepo from "./repos/session.repo"

// services

import {OAuthService} from "./services/oauth.service"
import LoginRiskService from "./risk/login.engine"
import RefreshTokenService from "./services/refreshToken.service"
import { TokenService } from "./services/token.service"
import OAuthVerifier from "./services/oauthVerifiers"

// adapters
import UserClient from "./adapters/user.client"

import GoogleOAuthAdapter from "./adapters/google.adapter"
import GithubOAuthAdapter from "./adapters/oauth/github.adapter"
import { GithubApi } from "./adapters/oauth/githubApi"
import { OAuthAdapter} from "./adapters/oauth/oauthAdapter"




export default function registerAuthDependencies(
  container: DependencyContainer
) {

  // ======================================================
  // INFRA
  // ======================================================

  const redis = createRedis()
container.register("Redis", {
  useValue: redis
});
  container.register(TOKENS.infra.redis, {
    useValue: redis
  })
  container.register(TOKENS.security.blacklist, {
  useClass: TokenService,
});
  // ======================================================
  // MODELS
  // ======================================================

  container.register(TOKENS.auth.models.session, {
    useValue: SessionModel
  })

  container.register(TOKENS.auth.models.riskEvent, {
    useValue: RiskEventModel
  })

  container.register(TOKENS.auth.models.refreshToken, {
    useValue: RefreshTokenModel
  })



  container.register(TOKENS.auth.models.oauthAccount, {
    useValue: OAuthAccountModel
  })

  // ======================================================
  // REPOSITORIES
  // ======================================================

  container.register(TOKENS.auth.repos.riskEventRepo, {
    useFactory: () => new RiskEventRepo()
  })



  container.register(TOKENS.auth.repos.refreshTokenRepo, {
    useFactory: (c) =>
      new RefreshTokenRepo({
        RefreshTokenModel: c.resolve(TOKENS.auth.models.refreshToken)
      })
  })

  container.register(TOKENS.auth.repos.oauthAccountRepo, {
    useFactory: (c) =>
      new OAuthAccountRepo({
        model: c.resolve(TOKENS.auth.models.oauthAccount)
      })
  })

  container.register(TOKENS.auth.repos.sessionRepo, {
    useFactory: (c) =>
      new SessionRepo({
        SessionModel: c.resolve(TOKENS.auth.models.session)
      })
  })

  // ======================================================
  // GRAPHQL CLIENT
  // ======================================================


 container.register(TOKENS.user.userClient, {
  useFactory: () => new UserClient()
})

  // ======================================================
  // OAUTH ADAPTERS
  // ======================================================

  container.register(TOKENS.clients.githubApi, {
    useFactory: () =>
      new GithubApi({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!
      })
  })

  container.register(TOKENS.auth.adapters.githubOAuthAdapter, {
    useFactory: (c) =>
      new GithubOAuthAdapter({
        githubApi: c.resolve(TOKENS.clients.githubApi)
      })
  })

  container.register(TOKENS.auth.adapters.googleOAuthAdapter, {
    useFactory: () =>
      new GoogleOAuthAdapter()
  })

  container.register(TOKENS.auth.adapters.oauthAdapter, {
    useFactory: (c) =>
      new OAuthAdapter({
        google: c.resolve(TOKENS.auth.adapters.googleOAuthAdapter),
        github: c.resolve(TOKENS.auth.adapters.githubOAuthAdapter)
      })
  })

container.registerSingleton(
  TOKENS.auth.services.oauthVerifier,
  OAuthVerifier
)

  // ======================================================
  // DOMAIN SERVICES
  // ======================================================

  container.register(TOKENS.auth.services.loginRiskService, {
    useFactory: (c) =>
      new LoginRiskService({
        riskEventRepo: c.resolve(TOKENS.auth.repos.riskEventRepo)
      })
  })

  container.register(TOKENS.auth.services.tokenService, {
    useFactory: (c) =>
      new TokenService(
        redis,
        c.resolve(TOKENS.security.blacklist)
      )
  })

  container.register(TOKENS.auth.services.refreshTokenService, {
    useFactory: (c) =>
      new RefreshTokenService(
        c.resolve(TOKENS.auth.models.refreshToken),
        c.resolve(TOKENS.auth.repos.refreshTokenRepo),
        c.resolve(TOKENS.auth.services.tokenService),
        c.resolve(TOKENS.auth.services.loginRiskService)
      )
  })

  container.register(TOKENS.auth.services.oauthVerifier, {
  useFactory: () => new OAuthVerifier()
})




  // ======================================================
  // APPLICATION SERVICE
  // ======================================================
container.register(TOKENS.auth.services.oauthService, {
  useFactory: (c) => 
    new OAuthService({
      adapterRegistry: c.resolve(TOKENS.auth.adapters.oauthAdapter),
      
      oauthVerifier: c.resolve(TOKENS.auth.services.oauthVerifier),     
      
      userClient: c.resolve(TOKENS.user.userClient),
      oauthAccountRepo: c.resolve(TOKENS.auth.repos.oauthAccountRepo),
      tokenService: c.resolve(TOKENS.auth.services.tokenService)

    })
})

}