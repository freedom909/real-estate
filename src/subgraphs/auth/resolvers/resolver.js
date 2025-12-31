import { GraphQLError } from "graphql";
import tokenService from "../services/token/token.service.js";
import oauthService from "../services/oauth/oauth.service.js";
import { setRefreshCookie } from "../cookies/setRefreshCookie.js";

const resolvers = {
  Mutation: {
login: async (_, args, { container, res }) => {
      const authService = container.resolve("authService");
      return authService.login(args, res);
    },

    oauthLogin: async (_, args, { container, res }) => {
      const oauthService = container.resolve("oauthService");
      const userService = container.resolve("userService");
      const tokenService = container.resolve("tokenService");

      const oauthUser = await oauthService.verify(args.provider, args.code);
      const user = await userService.findOrCreateByOAuth(oauthUser);

      const tokens = tokenService.issue(user);
      // setRefreshCookie(res, tokens.refreshToken)

      return {
        user,
        accessToken: tokens.accessToken,
      };
    },

    refreshToken: async (_, __, { container, req, res }) => {
      const refreshTokenService = container.resolve("refreshTokenService");
      return refreshTokenService.rotate(req.cookies.rt, res);
    },

    refreshToken: async (_, __, { req, res, container }) => {
      const oldToken = req.cookies?.rt;
      if (!oldToken) {
        throw new GraphQLError("Unauthenticated");
      }

      const refreshTokenService =
        container.resolve("refreshTokenService");

      const result = await refreshTokenService.rotate(oldToken);

      setRefreshCookie(res, result.refreshToken);

      return {
        accessToken: result.accessToken,
      };
    },
  },

  // auth-subgraph 只负责 entity reference
  User: {
    __resolveReference(ref) {
      return { id: ref.id };
    },
  },
};

export default resolvers;
