// src/subgraphs/auth/resolvers.js
import { TOKENS } from "../../../shared/container/tokens.js";



export default {
  Query: {
    me: async (_, __, { user, container }) => {
      if (!user) return null;

      const userClient = container.resolve(TOKENS.auth.userClient);
      return userClient.findById(user.userId);
    },
  },

  Mutation: {

oauthLogin: async (
  _,
  { provider, idToken },
  { container, req, res }
) => {
  const oauthAdapter =
    container.resolve(TOKENS.auth.oauthAdapter);

  // 1️⃣ 验证第三方 token
  const profile = await oauthAdapter.parse(provider, idToken);

  const authService =
    container.resolve(TOKENS.auth.authService);

  // 2️⃣ 领域登录
  const result = await authService.oauthLogin(profile, {
    ip: req.ip,
    deviceId: req.headers["x-device-id"],
    userAgent: req.headers["user-agent"],
  });

  // 4️⃣ 返回 payload（不含 refreshToken）
  return result;
},

    refreshToken: async (_, { refreshToken }, { container, req }) => {
      const service = container.resolve(
        TOKENS.auth.refreshTokenService
      );

      return service.refreshAccessToken(refreshToken, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    },

    bindOAuth: async (_, { provider, idToken }, { container, req, user }) => {
      if (!user) throw new Error("Unauthorized");

      const authService =
        container.resolve(TOKENS.auth.authService);

      return authService.bindOAuthAccount({
        userId: user.userId,
        provider,
        idToken,
        ip: req.ip,
        deviceId: req.headers["x-device-id"],
      });
    },

    unbindOAuth: async (_, { provider }, { container, req, user }) => {
      if (!user) throw new Error("Unauthorized");

      const authService =
        container.resolve(TOKENS.auth.authService);

      return authService.unbindOAuthAccount({
        userId: user.userId,
        provider,
        ip: req.ip,
        deviceId: req.headers["x-device-id"],
      });
    },
  },

  // ✅ ✅ ✅ 类型 resolver 在这里
AuthPayload: {
user: (parent) => ({
    __typename: "User",
    id: parent.userId.toString(),
  }),
},

};

