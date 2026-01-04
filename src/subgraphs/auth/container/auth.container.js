// src/subgraphs/auth/container/auth.container.js

import { TOKENS } from "../../../shared/container/tokens.js";
import createContainer from "../../../shared/container/createContainer.js";
import AuthService from "../services/auth.service.js";
import UserApiAdapter from "../adapters/user-api.adapter.js";
import OAuthService from "../services/oauth/oauth.service.js";
import TokenService from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";

export function createAuthContainer(
  { userApi, refreshTokenRepo } = {}
) {
  const container = createContainer();

  container.register(TOKENS.userApi, () => userApi);

  container.register(
    TOKENS.oauthService,
    () => new OAuthService()
  );

  container.register(
    TOKENS.tokenService,
    () => new TokenService()
  );

  container.register(
    TOKENS.refreshTokenService,
    () =>
      new RefreshTokenService({
        tokenService: container.resolve(TOKENS.tokenService),
        refreshRepo: refreshTokenRepo,
      })
  );

  container.register(
    TOKENS.userApiAdapter,
    () =>
      new UserApiAdapter({
        userApi: container.resolve(TOKENS.userApi),
      })
  );

  container.register(
    TOKENS.authService,
    () =>
      new AuthService({
        oauthService: container.resolve(TOKENS.oauthService),
        tokenService: container.resolve(TOKENS.tokenService),
        refreshTokenService: container.resolve(TOKENS.refreshTokenService),
        userApiAdapter: container.resolve(TOKENS.userApiAdapter),
      })
  );

  return container;
}
