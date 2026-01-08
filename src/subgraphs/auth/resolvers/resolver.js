// src/subgraphs/auth/resolvers/resolver.js

import { verifyCsrf } from "../http/csrf.helper.js";
import { setRefreshTokenCookie } from "../http/cookie.helper.js";
import { TOKENS } from "../../../shared/container/tokens.js";



export default {
  Mutation: {
    oauthLoginWithIdToken: async (
      _,
      { provider, idToken },
      { container, req }
    ) => {
      const authService =
        container.resolve(TOKENS.authService);

      return authService.oauthLoginWithIdToken(
        provider,
        idToken,
        {
          ip: req.ip,
          deviceId: req.headers["x-device-id"],
        }
      );
    },

    refreshToken: async (
      _,
      { refreshToken },
      { container, req }
    ) => {
      const service =
        container.resolve(
          TOKENS.refreshTokenService
        );

      return service.refreshAccessToken( 
        refreshToken,
        {
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        }
      );
    },


    refreshAccessToken: async (
      _,
      __,
      { req, res, container }
    ) => {
      console.log("🍪 incoming cookies:", req.cookies);
      verifyCsrf(req);

      const service = container.resolve(
        TOKENS.refreshTokenService
      );

      const result =
        await service.refreshAccessToken(
          req.cookies.refresh_token
        );

      setRefreshTokenCookie(
        res,
        result.refreshToken
      );
      console.log("🍪 response headers:", res.getHeaders());
      return { accessToken: result.accessToken };
    },
  },
};

