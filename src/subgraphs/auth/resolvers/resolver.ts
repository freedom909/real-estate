// src/subgraphs/auth/resolver.ts
import { TOKENS } from "../../../shared/container/tokens.js";
import { setAuthCookies } from "../../../infrastructure/auth/setAuthCookies.js";
import type { Request, Response } from "express";
import type OAuthAdapter from "../adapters/oauth/index.js";
import AuthService from "../services/auth.service.js";
import { Container } from "@/shared/container/createContainer.js";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";

interface User {
  userId: string;
  [key: string]: any;
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
    me: async (_: unknown, __: unknown, { user }: Context) => {
      if (!user) return null;

      return {
        __typename: "User",
        id: user.userId,
      };
    },


    mySessions: async (_, __, ctx: Context) => {
      return requireScope(["session:read"])(
        ctx,
        () =>
          sessionRepo.listByUser(ctx.user!.userId)
      );
    },
    OnlineSessions: async (_, __, ctx: Context) => {
      return requireScope(["session:read"])(
        ctx,
        () =>
          listOnlineSessions(ctx.redis!)
            .filter(
              (s: any) => s.userId === ctx.user!.userId
            )
      );
    },
  },

  Mutation: {

    refreshToken: async (_: unknown, { refreshToken }: { refreshToken: string }, { container }: Context) => {
      const authService = container.resolve<AuthService>(TOKENS.auth.authService);
      return authService.refresh(refreshToken); // プロパティ 'refresh' は型 'unknown' に存在しません。

    },

    revokeToken: async (_, __, { container, user }: Context) => {
      if (!user) throw new Error("Unauthorized");

      const service = container.resolve<RefreshTokenService>(TOKENS.auth.refreshTokenService);
      await service.revokeAll(user.userId);// プロパティ 'revokeAll' は型 'unknown' に存在しません。

      return true;
    },

    bindOAuth: async (_, { provider, idToken }, { container, req, user }: Context & { provider: string; idToken: string }) => {
      if (!user) throw new Error("Unauthorized");

      const authService = container.resolve<AuthService>(TOKENS.auth.authService);

      return authService.bindOAuthAccount( 
        provider,
        idToken,
        { // 名前 'ctx' が見つかりません。
          userId: user.userId,
          ip: req.ip,
          deviceId: req.headers["x-device-id"] as string,
        }
      );
    },

    unbindOAuth: async (_, { provider }, { container, req, user }: Context & { provider: string }) => {
      if (!user) throw new Error("Unauthorized");

      const authService = container.resolve<AuthService>(TOKENS.auth.authService);

      return authService.unbindOAuthAccount(
        
        provider,
       {
          userId: user.userId,
          ip: req.ip,
          deviceId: req.headers["x-device-id"] as string,
}
      );
    },

    logout: async (_, __, { container, req, user }: Context) => {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return true;

      if (!user) throw new Error("Unauthorized");


      const service = container.resolve<RefreshTokenService>(TOKENS.auth.refreshTokenService);
      await service.revokeAll(user!.userId);

      return true;
    },

    oauthLogin: async (
      _: unknown,
      { provider, idToken }: { provider: string; idToken: string },
      { container, req, res }: Context
    ) => {
      console.log("🔥 oauthLogin resolver triggered");

      const oauthAdapter = container.resolve<OAuthAdapter>(TOKENS.auth.oauthAdapter);
      // 1️⃣ 验证第三方 token
      const profile = await oauthAdapter.parse(provider, idToken);
    
      const authService = container.resolve<AuthService>(TOKENS.auth.authService);
    
      // 2️⃣ 领域登录
      let result;

      try {
        result = await authService.oauthLogin(profile, {
          ip: req.ip,
          deviceId: req.headers["x-device-id"] as string,
          userAgent: req.headers["user-agent"],
        });
      } catch (err) {
        console.error("❌ oauthLogin failed:", err);
        throw err;
      }

      console.log("typeof",typeof result.refreshToken);
      console.log("result",result.refreshToken);
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