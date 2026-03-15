//src/subgraphs/authz/resolvers/index.ts
console.log(typeof IdentityModel);

// src/subgraphs/auth/resolver.ts
import { TOKENS } from "../../shared/container/tokens.js";
import { setAuthCookies } from "../../infrastructure/auth/setAuthCookies.js";
import type { Request, Response } from "express";
import type {OAuthAdapter} from "./adapters/oauth/oauth.adapter.js";

import { container } from "tsyringe";
import RefreshTokenService from "./services/refreshToken.service";
import { ForbiddenError } from "@/infrastructure/utils/errors";
// import {OAuthService} from "./services/oauth.service";
import { subgraphAuthGuard } from "./guards/subgraphAuthGuard";
import { IdentityModel } from "../user/models/identity.model.js";
import { OAuthLoginService } from "./services/oauth.login.service.js";
import { TokenService } from "./services/token.service.js";


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
  userClient: any;
  tokenService: TokenService;
  blacklist: TokenService;
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

const refreshTokenRepository = {
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

        const authService = container.resolve(TOKENS.auth.services.authService);

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

refreshToken: async (_, { refreshToken }, ctx: Context) => {

  const refreshTokenService = container.resolve<RefreshTokenService>(TOKENS.auth.services.refreshTokenService)
    return refreshTokenService.refresh(refreshToken,ctx.userClient) 
},

    revokeToken: async (_, __, { user }: Context) => {
      if (!user) throw new Error("Unauthorized");

      const service = container.resolve<RefreshTokenService>(TOKENS.auth.services.refreshTokenService);
      await service.revokeAll(user.userId);

      return true;
    },

    // bindOAuth: async (_, { provider, idToken }, { req, user }: Context & { provider: string; idToken: string }) => {
    //   if (!user) throw new Error("Unauthorized");

    //   const oauthService = container.resolve<OAuthService>(TOKENS.auth.services.oauthService);

    //   return oauthService.bindOAuthAccount(
    //     user.userId,
    //     provider,
    //     idToken,
    //     {
        
    //       ip: req.ip,
    //       deviceId: req.headers["x-device-id"] as string,
    //     }
    //   );
    // },

    // unbindOAuth: async (_, { provider }, { req, user }: Context & { provider: string }) => {
    //   if (!user) throw new Error("Unauthorized");

    //   const authService = container.resolve<OAuthService>(TOKENS.auth.services.authService);

    //   return authService.unbindOAuthAccount(
    //     user.userId,
    //     provider,
    //     {
    //       ip: req.ip,
    //       deviceId: req.headers["x-device-id"] as string,
    //     }
    //   );
    // },

    logout: async (_, __, ctx) => {
      const decoded = await ctx.tokenService.verifyRefresh(ctx.req.cookies.refreshToken);

      await ctx.blacklist.add(decoded.jti, decoded.exp);

      return true;
    },

    oauthLogin: async (
      _: any,
      { provider, idToken }: { provider: string; idToken: string },
      { req }: Context
    ) => {
      const loginService = container.resolve<OAuthLoginService>(TOKENS.auth.services.oauthloginService);
      console.log("loginService", loginService)
      return loginService.oauthLogin(provider, idToken, req);
    },

    // revokeSession: async (_, { sessionId }, { user, req }) => {
    //   const token = req.headers.authorization?.replace("Bearer ", "");

    //   const authService = container.resolve<OAuthService>(
    //     TOKENS.auth.services.authService
    //   );

    //   return authService.revokeSession(
    //     user.userId,
    //     sessionId,
    //     token
    //   );
    // }
  },

  // ✅ ✅ ✅ 类型 resolver 在这里
  AuthPayload: {
    user: (parent: AuthPayload) => ({
      __typename: "User",
      id: parent.userId.toString(),
    }),
  },
};