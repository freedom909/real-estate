import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";
import { createUserGraphQLClient } from "../adapters/user.client.factory.js";

// ===== models =====
import CredentialModel from "../models/credential.model.js";
import SessionModel from "../models/session.model.js";
import RefreshTokenModel from "../models/refreshToken.model.js";
import OAuthAccountModel from "../models/oauthAccounts.model.js";
import UserModel from "../../user/models/user.model.js";
// ===== repos =====
import CredentialRepo from "../repos/credential.repo.js";
import RefreshTokenRepo from "../repos/refresh-token.repo.js";
import RiskEventRepo from "../repos/riskEvent.repo.js";
import OAuthAccountRepo from "../repos/oauthAccount.repo.js";
import UserRepo from "../repos/user.repo.js";
import SessionRepo from "../repos/session.repo.js";

// ===== services =====
import LoginRiskService from "../services/risk/loginRisk.service.js";
import TokenService from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import OAuthVerifier from "../services/oauth/oauthVerifier.js";

import { Redis } from "ioredis";
import AuthService from "../services/auth.service.js";

// ===== adapters =====
import UserClient from "../adapters/user.client.js";
import OAuthAdapter from "../adapters/oauth/index.js";
import GoogleOAuthAdapter from "../adapters/oauth/google.adapter.js";
import GitHubOAuthAdapter from "../adapters/oauth/github.adapter.js";
import { RedisAdapter } from "./RedisAdapter.js";
import MergeAccountService from "../../admin/Services/mergeAccount.service.js";
import { createRedis } from "@/infrastructure/redis/redis.js";

interface ContainerParams {
  redis: Redis;
  userApi?: any;
  refreshTokenRepo?: any;
}

export function createAuthContainer({ redis, userApi, refreshTokenRepo }: ContainerParams) {

  const container = createContainer();

  // ======================================================
  // INFRA
  // ======================================================
  container.register(TOKENS.infra.redis, () => redis);
  
  if (userApi) {
    container.register(TOKENS.auth.userApi, () => userApi);
  }
  
  if (refreshTokenRepo) {
    container.register(TOKENS.auth.refreshTokenRepo, () => refreshTokenRepo);
  }

  container.register(
  TOKENS.auth.userRepo,
  () =>
    new UserRepo({
      UserModel: UserModel, // your Mongoose User model
      redis: container.resolve(TOKENS.infra.redis),
    })
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
  TOKENS.auth.sessionRepo,
  () =>
    new SessionRepo({
      SessionModel: container.resolve(TOKENS.auth.sessionModel),
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
  TOKENS.auth.sessionModel,
  () => SessionModel
);


container.register(
  TOKENS.infra.cache,
  () => new RedisAdapter(redis)
);

container.register(
  TOKENS.auth.riskEventRepo,
  () => new RiskEventRepo({ redis: container.resolve(TOKENS.infra.cache) })
);


  // ======================================================
  // DOMAIN SERVICES
  // ======================================================
  container.register(
    TOKENS.auth.loginRiskService,
    () =>
      new LoginRiskService({
        riskEventRepo: container.resolve(
          TOKENS.auth.riskEventRepo
        ),
      })
  );

  container.register(
    TOKENS.auth.tokenService,
    () => new TokenService()
  );

  container.register(
    TOKENS.auth.refreshTokenService,
    () =>
      new RefreshTokenService({
        tokenService: container.resolve(
          TOKENS.auth.tokenService
        ),
        refreshTokenRepo: container.resolve(
          TOKENS.auth.refreshTokenRepo
        ),
        loginRiskService: container.resolve(
          TOKENS.auth.loginRiskService
        ),
        userRepo: container.resolve(
          TOKENS.auth.userRepo
        ),
      })
  );

container.register(
  TOKENS.auth.oauthAdapter,
  () => new OAuthAdapter({
    google: new GoogleOAuthAdapter({
        clientId: process.env.GOOGLE_CLIENT_ID,
      }),
  })
);

  container.register(
    TOKENS.auth.oauthVerifier,
    () => new OAuthVerifier()
  );

container.register(
  TOKENS.auth.oauthAccountRepo,
  () => new OAuthAccountRepo({ model: OAuthAccountModel })
);

  // ======================================================
  // APPLICATION SERVICE
  // ======================================================
container.register(
  TOKENS.auth.oauthAccountModel,
  () => OAuthAccountModel
);
container.register(
  TOKENS.auth.mergeAccountService,
  () => new MergeAccountService({
    ...container.resolve(TOKENS.auth.mergeAccountService),
    userRepo: container.resolve(TOKENS.auth.userRepo),
  })
);
  container.register(
    TOKENS.auth.authService,
    () =>
      new AuthService({
        oauthService: container.resolve(
          TOKENS.auth.oauthAdapter
        ),
        oauthAccountRepo: container.resolve(
        TOKENS.auth.oauthAccountRepo
      ),

        userClient: container.resolve(
          TOKENS.auth.userClient
        ),
        tokenService: container.resolve(
          TOKENS.auth.tokenService
        ),
       
        refreshTokenRepo: container.resolve(
          TOKENS.auth.refreshTokenRepo
        ),
        loginRiskService: container.resolve(
          TOKENS.auth.loginRiskService
        ),
        credentialRepo: container.resolve(
          TOKENS.auth.credentialRepo
        ),
        sessionRepo: container.resolve(
          TOKENS.auth.sessionRepo
        ),

      })
  );

  return container;
}