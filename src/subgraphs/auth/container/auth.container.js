import createContainer from "../../../shared/container/createContainer.js";
import { TOKENS } from "../../../shared/container/tokens.js";

import AuthService from "../services/auth.service.js";
import OAuthService from "../services/oauth/oauth.service.js";
import UserClient from "../adapters/user.client.js";

export function createAuthContainer() {
  const container = createContainer();

  container.register(
    TOKENS.oauthService,
    () => new OAuthService()
  );

  container.register(
    TOKENS.userClient,
    () => new UserClient()
  );

  container.register(
    TOKENS.authService,
    () =>
      new AuthService({
        oauthService: container.resolve(TOKENS.oauthService),
        userClient: container.resolve(TOKENS.userClient),
      })
  );

  return container;
}
