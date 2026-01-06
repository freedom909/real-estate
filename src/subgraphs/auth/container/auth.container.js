import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";

import AuthService from "../services/auth.service.js";
import OAuthService from "../services/oauth/oauth.service.js";
import TokenService from "../services/token/token.service.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import RefreshTokenRepo from "../repos/refresh-token.repo.js";
import UserClient from "../adapters/user.client.js";

export function createAuthContainer() {
  const container = createContainer();

  container.register(TOKENS.oauthService, () => new OAuthService());
  container.register(TOKENS.userClient, () => new UserClient());
  container.register(TOKENS.tokenService, () => new TokenService());
  container.register(TOKENS.refreshTokenRepo, () => new RefreshTokenRepo());

  container.register(
    TOKENS.refreshTokenService,
    () =>
      new RefreshTokenService({
        tokenService: container.resolve(TOKENS.tokenService),
        refreshRepo: container.resolve(TOKENS.refreshTokenRepo),
      })
  );

  container.register(
    TOKENS.authService,
    () =>
      new AuthService({
        oauthService: container.resolve(TOKENS.oauthService),
        userClient: container.resolve(TOKENS.userClient),
        tokenService: container.resolve(TOKENS.tokenService),
        refreshTokenService: container.resolve(
          TOKENS.refreshTokenService
        ),
      })
  );

  return container;
}
