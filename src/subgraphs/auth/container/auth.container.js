// src/subgraphs/auth/container/auth.container.js
import  createContainer  from "../../../shared/container/createContainer.js";
import { TOKENS } from "./tokens.js";
import UserAdapter from "../adapters/user.adapter.js";
import AuthService from "./../services/auth.service.js";
import OAuthService from "./../services/oauth/oauth.service.js";
import TokenService from "./../services/token/token.service.js";
import RefreshTokenService from "./../services/refresh/refreshToken.service.js";

export function createAuthContainer({
  userApi,
  refreshTokenRepo,
}) {
  const container = createContainer();

  // infra
  container.register(TOKENS.tokenService, () => new TokenService());
  container.register(TOKENS.oauthService, () => new OAuthService());

  container.register(TOKENS.userService, () =>
    new UserAdapter({ userApi })
  );

  container.register(TOKENS.refreshTokenService, () =>
    new RefreshTokenService({
      tokenService: container.resolve(TOKENS.tokenService),
      refreshRepo: refreshTokenRepo,
      userService: container.resolve(TOKENS.userService),
    })
  );

  return container;
}
