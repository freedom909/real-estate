// src/subgraphs/auth/resolvers/resolver.js

import { verifyCsrf } from "../http/csrf.helper.js";
import { setRefreshTokenCookie } from "../http/cookie.helper.js";
import { TOKENS } from "../../../shared/container/tokens.js";



export default {
    Query: {
    me: async (_, __, { user }) => user || null,
  },
  Mutation: {
    oauthLoginWithIdToken: async (
      _,
      { provider, idToken },
      { container, req }
    ) => {
      const authService =
        container.resolve(TOKENS.auth.authService);

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

    register: (_, args, { container }) =>
      container
        .resolve(TOKENS.auth.authService)
        .register(args),

    login: async (_, args, { container }) =>{
      return await container.resolve(TOKENS.auth.authService).login(args)
    },
      
    oauthLogin: async (
      _,
      { provider, code },
      { container }
    ) => {
      const authService =
        container.resolve(TOKENS.auth.authService); 
      // For simplicity, assume code → providerUserId & email
      const providerUserId = code + '_id'
      const email = code + '@example.com'
      const user = await authService.oauthLogin(provider, providerUserId, email)
      return {
        user,
        accessToken: 'dummyAccessToken',
        refreshToken: 'dummyRefreshToken'
      }
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

