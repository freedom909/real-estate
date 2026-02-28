import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";
import { createUserGraphQLClient } from "../adapters/user.client.factory.js";

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
import TokenService from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import OAuthVerifier from "../services/oauth/oauthVerifier.js";

import AuthService from "../services/auth.service.js";

// ===== adapters =====
import UserClient from "../adapters/user.client.js";
import OAuthAdapter from "../adapters/oauth/index.js";
import GoogleOAuthAdapter from "../adapters/oauth/google.adapter.js";
import GithubOAuthAdapter from "../adapters/oauth/github.adapter.js";

function createAuthContainer({ redis }) {
  const container = createContainer();

  // ======================================================
  // INFRA
  // ======================================================
  container.register(TOKENS.infra.redis, () => redis);
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
    () => new RiskEventRepo({ redis })
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
      // github: new GithubOAuthAdapter({
      //   githubApi: container.resolve(
      //     TOKENS.infra.githubApi
      //   ),
      // }),
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
        refreshTokenService: container.resolve(
          TOKENS.auth.refreshTokenService
        ),
        loginRiskService: container.resolve(
          TOKENS.auth.loginRiskService
        ),
        credentialRepo: container.resolve(
          TOKENS.auth.credentialRepo
        ),
        refreshTokenRepo: container.resolve(
          TOKENS.auth.refreshTokenRepo
        ),
        sessionRepo: container.resolve(
          TOKENS.auth.sessionRepo
        ),
      })
  );

  return container;
}
export default createAuthContainer;