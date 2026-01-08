// src/subgraphs/auth/container/auth.container.js
import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";

import TokenService from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import RefreshTokenRepo from "../repos/refresh-token.repo.js";
import LoginRiskService from "../services/risk/loginRisk.service.js";
import RiskEventRepo from "../repos/riskEvent.repo.js";
import OAuthService from "../services/oauth/oauth.service.js";
import AuthService from "../services/auth.service.js";
import UserClient from "../adapters/user.client.js";

export function createAuthContainer({ redis, userApi }) {
  const container = createContainer();

  // infra
  container.register(TOKENS.redis, () => redis);
  container.register(TOKENS.userClient, () => new UserClient(userApi));

  // repos
  container.register(
    TOKENS.refreshTokenRepo,
    () => new RefreshTokenRepo({ redis })
  );

  container.register(
    TOKENS.riskEventRepo,
    () => new RiskEventRepo({ redis })
  );

  // services
  container.register(
    TOKENS.tokenService,
    () => new TokenService()
  );

  container.register(
    TOKENS.loginRiskService,
    () =>
      new LoginRiskService({
        riskEventRepo: container.resolve(TOKENS.riskEventRepo),
      })
  );

  container.register(
    TOKENS.refreshTokenService,
    () =>
      new RefreshTokenService({
        tokenService: container.resolve(TOKENS.tokenService),
        refreshTokenRepo: container.resolve(TOKENS.refreshTokenRepo),
        loginRiskService: container.resolve(TOKENS.loginRiskService),
      })
  );

  container.register(
    TOKENS.oauthService,
    () => new OAuthService()
  );

  container.register(
    TOKENS.authService,
    () =>
      new AuthService({
        oauthService: container.resolve(TOKENS.oauthService),
        userClient: container.resolve(TOKENS.userClient),
        tokenService: container.resolve(TOKENS.tokenService),
        refreshTokenService: container.resolve(TOKENS.refreshTokenService),
        loginRiskService: container.resolve(TOKENS.loginRiskService),
      })
  );

  return container;
}
