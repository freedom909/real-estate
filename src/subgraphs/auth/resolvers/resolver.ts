// src/subgraphs/auth/resolver.ts
import { TOKENS } from "../../../shared/container/tokens.js";
import { setAuthCookies } from "../../../infrastructure/auth/setAuthCookies.js";
import type { Request, Response } from "express";
import type OAuthAdapter from "../adapters/oauth/index.js";
import AuthService from "../services/auth.service.js";
import { container } from "tsyringe";
import RefreshTokenService from "../services/refresh/refreshToken.service.js";
import { ForbiddenError } from "@/infrastructure/utils/errors.js";
import OAuthService from "../services/oauth/oauth.service.js";
import { subgraphAuthGuard } from "../guards/subgraphAuthGuard.js";
import TokenService from "../services/token/token.service.js";
import blacklist from "@/shared/security/blacklist.js";
import Blacklist from "@/shared/security/blacklist.js";

interface User {
  userId: string;
  [key: string]: any;
}

interface Context {
  user?: User;
  container: typeof container;
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

export const withAuth =
  (resolver: any, guard: any) =>
    async (parent: any, args: any, context: any, info: any) => {
      await guard(parent, args, context, async () => { })
      return resolver(parent, args, context, info)
    }
export default {

  Query: {
    me: withAuth(
      async (_: unknown, __: unknown, { user }: Context) => {
        if (!user) return null;

        return {
          __typename: "User",
          id: user.userId,
        };
      },
      subgraphAuthGuard
    ),



    mySessions: withAuth(
      async (_, __, { container, user }) => {
        if (!user) throw new ForbiddenError("Unauthorized");

        const authService = container.resolve(TOKENS.auth.authService);

        return authService.getMySessions(user.userId);
      },
      subgraphAuthGuard
    ),
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

refreshToken: async (_, { refreshToken }, ctx) => {
      const decoded = await ctx.tokenService.verifyRefresh(refreshToken);

      await ctx.blacklist.check(decoded.jti);

      const user = await ctx.userClient.userById(decoded.sub);

      const tokens = await ctx.tokenService.rotate(decoded, user);

      return {
        ...tokens,
        user: {
          __typename: "User",
          id: user.id,
        },
      };
    },

    revokeToken: async (_, __, { user }: Context) => {
      if (!user) throw new Error("Unauthorized");

      const service = container.resolve<RefreshTokenService>(TOKENS.auth.refreshTokenService);
      await service.revokeAll(user.userId);

      return true;
    },

    bindOAuth: async (_, { provider, idToken }, { req, user }: Context & { provider: string; idToken: string }) => {
      if (!user) throw new Error("Unauthorized");

      const authService = container.resolve<AuthService>(TOKENS.auth.authService);

      return authService.bindOAuthAccount(
        provider,
        idToken,
        {
          userId: user.userId,
          ip: req.ip,
          deviceId: req.headers["x-device-id"] as string,
        }
      );
    },

    unbindOAuth: async (_, { provider }, { req, user }: Context & { provider: string }) => {
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

    logout: async (_, __, { req, user }: Context) => {
      if (!user) throw new Error("Unauthorized");

      const tokenService = container.resolve<TokenService>(TOKENS.auth.authService);
      const blacklist = container.resolve<Blacklist>(TOKENS.security.blacklist);
      const refreshService = container.resolve<RefreshTokenService>(
        TOKENS.auth.refreshTokenService
      );

      // 1️⃣ Blacklist access token
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const accessToken = authHeader.split(" ")[1];
        const decoded = await tokenService.verifyAccessToken(accessToken);

        await blacklist.blacklist(decoded.jti, decoded.exp);
      }

      // 2️⃣ Revoke refresh tokens (DB)
      await refreshService.revokeAll(user.userId);

      return true;
    },

    oauthLogin: async (_, { provider, idToken }, ctx) => {
      const payload = await ctx.oauthService.verify(provider, idToken);

      if (!payload.email) {
        throw new Error("Invalid OAuth token");
      }

      // 调用 User Subgraph mutation
      const user = await ctx.userClient.createOAuthUser({
        email: payload.email,
        profile: {
          name: payload.name,
          avatar: payload.picture,
          email: payload.email,
        },
      });

      const tokens = await ctx.tokenService.issueTokens(user);

      return {
        ...tokens,
        user: {
          __typename: "User",
          id: user.id,
        },
      };
    },

    revokeSession: async (_, { sessionId }, { user, req }) => {
      const token = req.headers.authorization?.replace("Bearer ", "");

      const authService = container.resolve<AuthService>(
        TOKENS.auth.authService
      );

      return authService.revokeSession(
        user.userId,
        sessionId,
        token
      );
    }
  },

  // ✅ ✅ ✅ 类型 resolver 在这里
  AuthPayload: {
    user: (parent: AuthPayload) => ({
      __typename: "User",
      id: parent.userId.toString(),
    }),
  },
};