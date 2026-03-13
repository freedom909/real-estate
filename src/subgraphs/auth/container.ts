// src/subgraphs/authz/container/auth.container.ts

import { DependencyContainer, registry } from "tsyringe"
import { TOKENS } from "../../shared/container/tokens"

// infra
import { createRedis } from "@/infrastructure/redis/redis"

// models

import RefreshTokenModel from "./models/refreshToken.model"
import CredentialModel from "./models/credential.model"
import SessionModel from "./models/session.model"
import RiskEventModel from "./models/riskEvent.model"

// repos
import CredentialRepo from "../user/repos/credential.repo"
import RefreshTokenRepository from "./repos/refresh-token.repo"
import credentialRepo from "./repos/credential.repo"
import{ RiskEventRepo} from "./repos/riskEvent.repo"
import SessionRepository from "./repos/session.repo"

// services

// import {OAuthService} from "./services/oauth.service"
import LoginRiskService from "./services/risk/login.risk.service"
import RefreshTokenService from "./services/refreshToken.service"
import { TokenService } from "./services/token.service"
import OAuthVerifier from "./services/oauthVerifiers"


// adapters
import UserClient from "./adapters/user.client"
import { GoogleOAuthAdapter } from "./adapters/3rdLogin/google.adapter";



import GithubOAuthAdapter from "./adapters/3rdLogin/github.adapter"
import GithubApi  from "./adapters/3rdLogin/github.adapter"
import { OAuthAdapter} from "./adapters/oauth/oauth.adapter"
import { OAuthLoginService } from "./services/oauth.login.service"
import OAuthAdapterRegistry from "./adapters/oauth.adapter.registry"


export default function registerAuthDependencies(
  container: DependencyContainer
) {
  container.registerSingleton(OAuthAdapterRegistry)

  container.registerSingleton(GoogleOAuthAdapter)

  container.registerSingleton(GithubOAuthAdapter)


//  const adapterRegistry = container.resolve<OAuthAdapterRegistry>(OAuthAdapterRegistry)
// const adapterRegistry =
//   container.resolve<OAuthAdapterRegistry>(
//     TOKENS.auth.adapters.oauthAdapter
//   )
// adapterRegistry.register(


//   container.resolve(GoogleOAuthAdapter)
// )

// adapterRegistry.register(
 
//   container.resolve(GithubOAuthAdapter)
// )
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



  container.register(TOKENS.auth.models.credential, {
    useValue: CredentialModel
  })

  // ======================================================
  // REPOSITORIES
  // ======================================================

  container.register(TOKENS.auth.repos.riskEventRepo, {
    useFactory: (c) => new RiskEventRepo(
      c.resolve(TOKENS.auth.models.riskEvent)
    )
  })

  container.register(TOKENS.auth.repos.refreshTokenRepo, {
    useFactory: (c) =>
      new RefreshTokenRepository({
        RefreshTokenModel: c.resolve(TOKENS.auth.models.refreshToken)
      })
  })

  container.register(TOKENS.auth.repos.credentialRepo, {
    useFactory: (c) =>
      new CredentialRepo({
        CredentialModel: c.resolve(TOKENS.auth.models.credential)
      })
  })


  container.register(TOKENS.auth.repos.sessionRepo, {
    useFactory: (c) =>
      new SessionRepository({
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
container.registerSingleton(
  TOKENS.auth.adapters.oauthAdapter,
  OAuthAdapterRegistry
)
  container.register(TOKENS.clients.githubApi, {
    useFactory: () =>
      new GithubApi()
  })

  container.register(TOKENS.auth.adapters.githubOAuthAdapter, {
    useFactory: (c) =>
      new GithubOAuthAdapter()
  })

  container.register(TOKENS.auth.adapters.googleOAuthAdapter, {
    useFactory: () =>
      new GoogleOAuthAdapter()
  })

  // container.register(TOKENS.auth.adapters.oauthAdapter, {
  //   useFactory: (c) =>
  //     new OAuthAdapterRegistry()
  // })

  container.registerSingleton(
  TOKENS.auth.adapters.oauthAdapter,
  OAuthAdapterRegistry
)
//const adapterRegistry =
  //container.resolve<OAuthAdapterRegistry>(TOKENS.auth.adapters.oauthAdapter)

// adapterRegistry.register(
//   "GOOGLE",
//   container.resolve(GoogleOAuthAdapter)
// )
container.registerSingleton(
  TOKENS.auth.adapters.oauthAdapter,
  OAuthAdapterRegistry
)
// adapterRegistry.register(
//   "GITHUB",
//   container.resolve(GithubOAuthAdapter)
// )
container.registerSingleton(
  TOKENS.auth.services.oauthVerifier,
  OAuthVerifier
)
// container.register(TOKENS.auth.adapters.oauthAdapterRegistry,{
//   useValue:OAuthAdapterRegistry
// }
// )

container.registerSingleton(GoogleOAuthAdapter)
container.register(TOKENS.auth.adapters.oauthAdapterRegistry, {
  useFactory: (c) =>
    new OAuthAdapterRegistry(
      c.resolve(TOKENS.auth.adapters.googleOAuthAdapter)
    )
})
container.registerSingleton(
  TOKENS.auth.adapters.googleOAuthAdapter,
  GoogleOAuthAdapter
)
  // ======================================================
  // DOMAIN SERVICES
  // ======================================================

  container.register(TOKENS.auth.services.loginRiskService, {
    useFactory: (c) =>
      new LoginRiskService(
        c.resolve<RiskEventRepo>(TOKENS.auth.repos.riskEventRepo)
      )
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
    useFactory: () =>
      new OAuthVerifier()
})


container.register(TOKENS.auth.services.oauthVerifier, {
  useFactory: (c) =>
new OAuthVerifier()

  
})

  // ======================================================
  // APPLICATION SERVICE
  // ======================================================
// container.register(TOKENS.auth.services.oauthService, {
//   useFactory: (c) => 
//     new OAuthService({
//       adapterRegistry: c.resolve(TOKENS.auth.adapters.oauthAdapter),
//       oauthVerifier: c.resolve(TOKENS.auth.services.oauthVerifier),     
//       userClient: c.resolve(TOKENS.user.userClient),
//       credentialRepo: c.resolve(TOKENS.auth.repos.credentialRepo),
//       tokenService: c.resolve(TOKENS.auth.services.tokenService),
//       sessionRepository: c.resolve(TOKENS.auth.repos.sessionRepo),
//       loginRiskService: c.resolve(TOKENS.auth.services.loginRiskService), 
//       refreshTokenRepo: c.resolve(TOKENS.auth.repos.refreshTokenRepo)
//    })
// })



container.register(TOKENS.auth.services.oauthloginService, {
  useFactory: (c) =>
    new OAuthLoginService(
     c.resolve(TOKENS.user.userClient),
      c.resolve(TOKENS.auth.services.tokenService),
      c.resolve(TOKENS.auth.repos.refreshTokenRepo), 

      c.resolve(TOKENS.auth.services.oauthVerifier),
      c.resolve(TOKENS.auth.services.loginRiskService),
      c.resolve(TOKENS.auth.repos.sessionRepo),
      c.resolve(TOKENS.auth.adapters.oauthAdapterRegistry),
)
})

}

