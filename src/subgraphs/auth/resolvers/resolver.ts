// src/subgraphs/auth/resolver.ts
import { TOKENS } from "../../../shared/container/tokens.js";
import { setAuthCookies } from "../../../infrastructure/auth/setAuthCookies.js";
import type { Request, Response } from "express";

interface User {
  userId: string;
  [key: string]: any;
}

interface Container {
  resolve(token: symbol): any;
}


interface Context {
  user?: User;
  container: Container;
  req: Request;
  res: Response;
  redis?: any;
}

interface AuthPayload {
  userId: string;
  [key: string]: any;
}

const requireScope = (scopes: string[]) => (ctx: Context, fn: () => any) => {
  // スコープチェックのロジックをここに実装
  // 便宜上、常にfnを実行するようにしています
  return fn();
};

const sessionRepo = {
  listByUser: (userId: string) => Promise.resolve([]),
  revoke: (sessionId: string) => Promise.resolve()
};

const refreshTokenRepo = {
  revokeBySession: (sessionId: string) => Promise.resolve()
};

const listOnlineSessions = (redis: any) => {
  // オンラインセッションをリストするロジック
  return [];
};

export default {
  Query: {
    me: async (_, __, { user, container }: Context) => {
      if (!user) return null;

      const userClient = container.resolve(TOKENS.auth.userClient);
      return userClient.findById(user.userId);
    },
    mySessions: async (_, __, ctx: Context) => {
      return requireScope(["session:read"])(
        ctx,
        () =>
          sessionRepo.listByUser(ctx.user!.sub)
      );
    },
    OnlineSessions: async (_, __, ctx: Context) => {
      return requireScope(["session:read"])(
        ctx,
        () =>
          listOnlineSessions(ctx.redis!)
            .filter(
              (s: any) => s.userId === ctx.user!.sub
            )
      );
    },
  },

  Mutation: {
    refreshToken: async (_, __, { container, req }: Context) => {
      const token = req.cookies?.refresh_token;

      console.log("🍪 auth refresh_token cookie =", token);

      if (!token) {
        throw new Error("No refresh token");
      }

      const service = container.resolve(
        TOKENS.auth.refreshTokenService
      );

      return service.refreshAccessToken(token, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        deviceId: req.headers["x-device-id"],
      });
    },

    revokeToken: async (_, __, { container, user }: Context) => {
      if (!user) throw new Error("Unauthorized");

      const service = container.resolve(TOKENS.auth.refreshTokenService);
      await service.revokeAll(user.userId);

      return true;
    },

    bindOAuth: async (_, { provider, idToken }, { container, req, user }: Context & { provider: string; idToken: string }) => {
      if (!user) throw new Error("Unauthorized");

      const authService = container.resolve(TOKENS.auth.authService);

      return authService.bindOAuthAccount({
        userId: user.userId,
        provider,
        idToken,
        ip: req.ip,
        deviceId: req.headers["x-device-id"],
      });
    },

    unbindOAuth: async (_, { provider }, { container, req, user }: Context & { provider: string }) => {
      if (!user) throw new Error("Unauthorized");

      const authService = container.resolve(TOKENS.auth.authService);

      return authService.unbindOAuthAccount({
        userId: user.userId,
        provider,
        ip: req.ip,
        deviceId: req.headers["x-device-id"],
      });
    },

    logout: async (_, __, { container, req, user }: Context) => {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) return true;

      const service = container.resolve(TOKENS.auth.refreshTokenService);
      await service.revokeAll(user!.userId);

      return true;
    },

    oauthLogin: async (
      _:unknown,
      { provider, idToken }: { provider: string; idToken: string },
      { container, req, res }: Context 
    ) => {
      const oauthAdapter = container.resolve(TOKENS.auth.oauthAdapter);

      // 1️⃣ 验证第三方 token
      const profile = await oauthAdapter.parse(provider, idToken);

      const authService = container.resolve(TOKENS.auth.authService);

      // 2️⃣ 领域登录
      const result = await authService.oauthLogin(profile,
        {
          ip: req.ip,
          deviceId: req.headers["x-device-id"],
          userAgent: req.headers["user-agent"],
        });
       
      setAuthCookies(res, result);
      console.log("🍪 setting refresh_token cookie");
      return result;
    },

    revokeSession: async (
      _,
      { sessionId },
      ctx: Context
    ) =>
      requireScope(["session:revoke"])(
        ctx,
        async () => {
          await sessionRepo.revoke(sessionId);
          await refreshTokenRepo.revokeBySession(
            sessionId
          );
          return true;
        }
      ),
  },

  // ✅ ✅ ✅ 类型 resolver 在这里
  AuthPayload: {
    user: (parent: AuthPayload) => ({
      __typename: "User",
      id: parent.userId.toString(),
    }),
  },
};