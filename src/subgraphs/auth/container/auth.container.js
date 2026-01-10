import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";

// models
import CredentialModel from "../models/credential.model.js";

// repos
import CredentialRepo from "../repos/credential.repo.js";
import RefreshTokenRepo from "../repos/refresh-token.repo.js";
import LoginRiskService from "../services/risk/loginRisk.service.js";
import RiskEventRepo from "../repos/riskEvent.repo.js";
// adapters
import UserClient from "../adapters/user.client.js";

// services
import TokenService from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import OAuthService from "../services/oauth/oauth.service.js";
import AuthService from "../services/auth.service.js";

export function createAuthContainer({ redis, userApi }) {
  const container = createContainer();

  // ===== infra =====
  container.register(TOKENS.infra.redis, () => redis);

  // ===== models =====
  container.register(
    TOKENS.auth.credentialModel,
    CredentialModel
  );

  // ===== adapters =====
  container.register(
    TOKENS.auth.userClient,
    () => new UserClient(userApi)
  );

  // ===== repos =====
  container.register(
    TOKENS.auth.credentialRepo,
    () =>
      new CredentialRepo({
        credentialModel: container.resolve(TOKENS.auth.credentialModel),
      })
  );

container.register(
  TOKENS.auth.riskEventRepo,
  () => new RiskEventRepo({ redis })
);

container.register(
  TOKENS.auth.loginRiskService,
  () =>
    new LoginRiskService({
      riskEventRepo: container.resolve(TOKENS.auth.riskEventRepo),
    })
);

  container.register(
    TOKENS.auth.refreshTokenRepo,
    () =>
      new RefreshTokenRepo({
        redis: container.resolve(TOKENS.infra.redis),
      })
  );

  // ===== services =====
  container.register(
    TOKENS.auth.tokenService,
    () => new TokenService()
  );

  container.register(
    TOKENS.auth.refreshTokenService,
    () =>
      new RefreshTokenService({
        tokenService: container.resolve(TOKENS.auth.tokenService),
        refreshTokenRepo: container.resolve(TOKENS.auth.refreshTokenRepo),
      })
  );

  container.register(
    TOKENS.auth.oauthService,
    () =>
      new OAuthService({
        userClient: container.resolve(TOKENS.auth.userClient),
        credentialRepo: container.resolve(TOKENS.auth.credentialRepo),
      })
  );

  container.register(
    TOKENS.auth.authService,
    () =>
      new AuthService({
      oauthService: container.resolve(TOKENS.auth.oauthService),
      userClient: container.resolve(TOKENS.auth.userClient),
      tokenService: container.resolve(TOKENS.auth.tokenService),
      refreshTokenService: container.resolve(TOKENS.auth.refreshTokenService),
      loginRiskService: container.resolve(TOKENS.auth.loginRiskService),
      credentialRepo: container.resolve(TOKENS.auth.credentialRepo),
      })
  );
console.log(
  "OAuth deps =",
  !!container.resolve(TOKENS.auth.userClient),
  !!container.resolve(TOKENS.auth.credentialRepo)
);

  return container;
}
