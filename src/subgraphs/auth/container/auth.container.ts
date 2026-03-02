import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";
import { createUserGraphQLClient } from "../adapters/user.client.factory.js";
import AccessTokenBlacklist from "../../../shared/security/blacklist.js";
// ===== models =====
import CredentialModel from "../models/credential.model.js";
import RefreshTokenModel from "../models/refreshToken.model.js";
import OAuthAccountModel from "../models/oauthAccounts.model.js";
import UserModel from "../../user/models/user.model.js";
// ===== repos =====
import CredentialRepo from "../repos/credential.repo.js";
import RefreshTokenRepo from "../repos/refresh-token.repo.js";
import RiskEventRepo from "../repos/riskEvent.repo.js";
import OAuthAccountRepo from "../repos/oauthAccount.repo.js";
import UserRepo from "../repos/user.repo.js";
// ===== services =====
import LoginRiskService from "../services/risk/loginRisk.service.js";
import TokenService, { KeyProvider } from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import OAuthVerifier from "../services/oauth/oauthVerifier.js";

import AuthService from "../services/auth.service.js";
import { container, instanceCachingFactory } from "tsyringe";
// ===== adapters =====
import UserClient from "../adapters/user.client.js";
import OAuthAdapter from "../adapters/oauth/index.js";
import GoogleOAuthAdapter from "../adapters/oauth/google.adapter.js";
import GithubOAuthAdapter from "../adapters/oauth/github.adapter.js";
import { createClient } from "redis";
import { EnvKeyProvider } from "../services/token/env-key.provider.js";
import SessionModel from "../models/session.model.js";
import SessionRepo from "../repos/session.repo.js";
import { GithubApi } from "../adapters/oauth/githubApi.js";

import redis from "@/infrastructure/redis/redis.js";
import TokenBindingService from "../middleware/tokenBindingService.js";
import { AuthGuard } from "../guards/auth.guard.js";
import OAuthService from "../services/oauth/oauth.service.js";



 function createAuthContainer() {
  const container = createContainer();
  
  container.register(TOKENS.auth.authGuard, () => AuthGuard);
  container.register(TOKENS.auth.tokenBindingService, () => TokenBindingService);
 
  // =============================
  // =============================
  // Infra - Redis
  // =============================

  container.register(TOKENS.infra.redis, () => {
    const client = createClient({
      url: process.env.REDIS_URL,
    });

    client.connect().catch(console.error);
    return client;
  });

  // ======================================================
  // MODELS
  // ======================================================
  container.register(
    TOKENS.auth.credentialModel,
    () => CredentialModel
  );

  container.register(
    TOKENS.auth.refreshTokenModel,
    () => RefreshTokenModel
  );

  // ======================================================
  // REPOSITORIES
  // ======================================================
  container.register(
    TOKENS.auth.credentialRepo,
    () =>
      new CredentialRepo({
        CredentialModel: container.resolve(
          TOKENS.auth.credentialModel
        ),
      })
  );
    container.register(
    TOKENS.auth.refreshTokenRepo,
    () =>
      new RefreshTokenRepo({
        RefreshTokenModel: container.resolve(
          TOKENS.auth.refreshTokenModel
        ),
      })
  );

  container.register(
    TOKENS.auth.riskEventRepo,
    () => new RiskEventRepo()
  );

  container.register(
    TOKENS.auth.userRepo,
    () => new UserRepo({ UserModel: UserModel })
  );

  container.register(
    TOKENS.auth.sessionRepo,
    () => new SessionRepo({ SessionModel: SessionModel })
  );


    // ======================================================
  // GRAPHQL CLIENT (User Subgraph)
  // ======================================================
  container.register(
    TOKENS.auth.userGraphQLClient,
    () => createUserGraphQLClient()
  );

    // ======================================================
  // ACL — UserClient (Auth → User Subgraph)
  // ======================================================
  container.register(
    TOKENS.auth.userClient,
    () =>
      new UserClient(
        container.resolve(TOKENS.auth.userGraphQLClient)
      ),
  );
  
  // =============================
  // Infra - JWT Key Provider
  // =============================

  container.register(TOKENS.auth.keyProvider, () => {
    return new EnvKeyProvider();
  });

container.register(
  TOKENS.auth.googleOAuthAdapter,
  () =>
    new GoogleOAuthAdapter({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    }),
);

container.register(
  TOKENS.auth.githubOAuthAdapter,
  (c) =>
    new GithubOAuthAdapter({
      githubApi: c.resolve(TOKENS.infra.githubApi),
    }),
);
container.register(
  TOKENS.infra.githubApi,
  () =>
    new GithubApi({ // 名前 'GithubApi' が見つかりません。should it need to write?
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
);

container.register(TOKENS.auth.oauthAdapter, (c) => {
  return new OAuthAdapter({
    google: c.resolve<GoogleOAuthAdapter>(TOKENS.auth.googleOAuthAdapter),
    github: c.resolve<GithubOAuthAdapter>(TOKENS.auth.githubOAuthAdapter),
   // facebook: c.resolve<FacebookOAuthAdapter>(TOKENS.auth.facebookOAuthAdapter),
  });
});

  container.register(
    TOKENS.auth.oauthVerifier,
    () => new OAuthVerifier()
  );

container.register(
  TOKENS.auth.oauthAccountRepo,
  () => new OAuthAccountRepo({ model: OAuthAccountModel })
);

  // ======================================================
  // DOMAIN SERVICES
  // ======================================================
  container.register(
  TOKENS.auth.oauthService,
  (c) =>
    new OAuthService({
      oauthAdapter: c.resolve(TOKENS.auth.oauthAdapter),
      oauthVerifier: c.resolve(TOKENS.auth.oauthVerifier),// オブジェクト リテラルは既知のプロパティのみ指定できます。'oauthVerifier' は型 'OAuthServiceDeps' に存在しません。
      oauthAccountRepo: c.resolve(TOKENS.auth.oauthAccountRepo),
      userRepo: c.resolve(TOKENS.auth.userRepo),
    })
);

  container.register(
    TOKENS.auth.loginRiskService,
    () =>
      new LoginRiskService({
        riskEventRepo: container.resolve(
          TOKENS.auth.riskEventRepo
        ),
      })
  );
  // =============================
  // Infra - Token Service
  // =============================
//パラメーター 'c' の型は暗黙的に 'any' になっていますが、使い方からより良い型を推論できます。

  container.register(TOKENS.auth.tokenService, (c) => {
    const keyProvider = c.resolve<KeyProvider>(TOKENS.auth.keyProvider);
    console.log("keyProvider:",keyProvider);

    return new TokenService(keyProvider, {
      issuer: process.env.JWT_ISSUER,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
    });
  });

  container.register(
    TOKENS.infra.accessTokenBlacklist,
    () => new AccessTokenBlacklist(redis)
  )
  // =============================
  // Application - AuthService
  // =============================


container.register<AuthService>(
  TOKENS.auth.authService,
  
    (c) => {
      return new AuthService({
        oauthService: c.resolve(TOKENS.auth.oauthService),
        userClient: c.resolve(TOKENS.auth.userClient),
        credentialRepo: c.resolve(TOKENS.auth.credentialRepo),
        tokenService: c.resolve(TOKENS.auth.tokenService),
        loginRiskService: c.resolve(TOKENS.auth.loginRiskService),
        refreshTokenRepo: c.resolve(TOKENS.auth.refreshTokenRepo),
        oauthAccountRepo: c.resolve(TOKENS.auth.oauthAccountRepo),
        sessionRepo: c.resolve(TOKENS.auth.sessionRepo),
        accessTokenBlacklist: c.resolve(
          TOKENS.infra.accessTokenBlacklist
        ),
      });
    })

  return container;
  }

export default createAuthContainer;