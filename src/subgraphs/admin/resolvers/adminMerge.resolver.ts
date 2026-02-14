// src/subgraphs/auth/resolvers/adminMerge.resolver.ts

import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
import { TOKENS } from "../../../shared/container/tokens.js";

interface User {
  userId: string;
  role: string;
  [key: string]: any;
}

interface Request {
  ip: string;
  headers: {
    [key: string]: string | string[] | undefined;
  };
}

interface Context {
  user?: User;
  container: any;
  req: Request;
}

interface MergeService {
  mergeExplicit(params: any): Promise<string>;
  previewMerge(params: any): Promise<any>;
}

interface AdminMergeParams {
  fromUserId: string;
  toUserId: string;
  reason?: string;
}

interface AdminPreviewMergeParams {
  fromUserId: string;
  toUserId: string;
}

export default {
  Mutation: {
    adminMergeAccounts: async (
      _,
      { fromUserId, toUserId, reason }: AdminMergeParams,
      { user, container, req }: Context
    ) => {
      /**
       * 🔐 HARD GUARD
       */
      if (!user || user.role !== "ADMIN") {
        throw new GraphQLError("Forbidden", {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      if (!reason || reason.length < 10) {
        throw new GraphQLError("Reason too short", {
          extensions: {
            code: ERROR_CODES.VALIDATION_FAILED,//プロパティ 'VALIDATION_FAILED' は型 'typeof ERROR_CODES' に存在しません。
          },
        });
      }

      const mergeService = container.resolve(
        // プロパティ 'mergeAccountService' は型 '{ userApi: symbol; userClient: symbol; userService: symbol; userGraphQLClient: symbol; userSubgraphClient: symbol; oauthAdapter: symbol; oauthVerifier: symbol; googleOAuthAdapter: symbol; ... 12 more ...; authService: symbol; }' に存在しません。
        TOKENS.auth.mergeAccountService
      ) as MergeService;

      const mergedUserId = await mergeService.mergeExplicit({
        fromUserId,
        toUserId,
        reason,
        operator: {
          userId: user!.userId,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      return {
        success: true,
        mergedFrom: fromUserId,
        mergedInto: mergedUserId,
      };
    },

    adminPreviewMerge: async (
      _,
      { fromUserId, toUserId }: AdminPreviewMergeParams,
      { user, container, req }: Context
    ) => {
      if (!user || user.role !== "ADMIN") {
        throw new GraphQLError("Forbidden", {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      if (fromUserId === toUserId) {
        throw new GraphQLError("Cannot merge same user", {
          extensions: {

            // プロパティ 'VALIDATION_FAILED' は型 'typeof ERROR_CODES' に存在しません。
            code: ERROR_CODES.VALIDATION_FAILED,
          },
        });
      }

      const mergeService = container.resolve(
        // プロパティ 'mergeAccountService' は型 '{ userApi: symbol; userClient: symbol; userService: symbol; userGraphQLClient: symbol; userSubgraphClient: symbol; oauthAdapter: symbol; oauthVerifier: symbol; googleOAuthAdapter: symbol; ... 12 more ...; authService: symbol; }' に存在しません。
        TOKENS.auth.mergeAccountService
      ) as MergeService;

      return mergeService.previewMerge({
        fromUserId,
        toUserId,
        operator: {
          userId: user!.userId,
          ip: req.ip,
        },
      });
    },
  },
};