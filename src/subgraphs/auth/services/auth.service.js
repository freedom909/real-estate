// src/subgraphs/auth/services/auth.service.js
import { GraphQLError } from "graphql";

export default class AuthService {
  constructor({
    oauthService,
    tokenService,
    refreshTokenService,
    userApiAdapter,
  }) {
    this.oauthService = oauthService;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
    this.userApiAdapter = userApiAdapter;
  }

  async oauthLoginWithIdToken(provider, idToken) {
    const oauthUser =
      await this.oauthService.verifyIdToken(provider, idToken);

    console.log("🚀 calling user subgraph with:", oauthUser);

    let user;
    try {
      user = await this.userApiAdapter.findOrCreateByOAuth(oauthUser);
    } catch (err) {
      // ✅ 这里能看到「真实错误」
      console.error("💥 Real user-subgraph error:", {
        message: err.message,
        source: err.source,
        status: err.status,
        responseBody: err.responseBody,
        graphQLErrors: err.graphQLErrors,
        stack: err.stack,
      });

      // ✅ 对外统一错误
      throw new GraphQLError("Authentication service unavailable", {
        extensions: {
          code: "AUTH_DEPENDENCY_FAILED",
          service: "USER_SUBGRAPH",
          source: err.source,
        },
      });
    }

    const tokens = await this.refreshTokenService.issue(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }
}
