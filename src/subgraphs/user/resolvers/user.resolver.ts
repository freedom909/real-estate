// src/subgraphs/user/resolvers/index.ts

import UserService from "@/application/user/services/user.service";
import { Action, Resource } from "../../../domain/user/types/types";
import { TOKENS } from "../../../shared/container/tokens";
import { IUserDB } from "../models/user.model.js";
import { ForbiddenError } from "@/infrastructure/utils/errors";
import { container } from "tsyringe";
import PolicyEngine from "@/security/policy.engine";
import AuthService from "@/subgraphs/auth/services/auth.service";
import userService from "../services/user.service";
interface ResolverContext {
  container: typeof container;
  services: any;
  user?: any;
}

interface UserReference {
  id: string;
  __typename?: string;
}

// user.resolver.ts

export const createUserResolvers = () => {
  return {
    Query: {
      User: {
    __resolveReference: async (ref, { userService }) => {
      return await userService.findById(ref.id);
    },
  },
      userById: async (_: unknown, { id }: { id: string }, { user }: ResolverContext) => {
        const policyEngine = container.resolve<PolicyEngine>(TOKENS.security.policyEngine);
        const userService = container.resolve<UserService>(TOKENS.user.userService);

        const targetUser = await userService.findById(id);

        if (!targetUser) {
          return null
        }

        const policyContext = {
          user: user ? { id: user.id, role: user.role } : undefined,
          resourceOwnerId: targetUser.id
        }
        const allowed = policyEngine.can(Action.READ,
          Resource.USER, {
          user: policyContext.user ?? undefined,
          resourceOwnerId: targetUser.id.toString(),
        })
        if (!allowed) {
          throw new ForbiddenError("Access denied");
        }
        return targetUser;
      },

      userByEmail: async (_: unknown, { email }: { email: string }) => {
        const userService = container.resolve<UserService>(TOKENS.user.userService);
        return userService.findByEmail(email);
      },
    },

    Mutation: {
      deactivateUser: async (
        _: unknown,
        { userId }: { userId: string }
      ) => {
        const userService = container.resolve<UserService>(TOKENS.user.userService);
        return userService.deactivate(userId);
      },
    },
    createOAuthUser: async (
      _: unknown,
      { input }: { input: { email: string; profile?: any } }
    ) => {
      const userService = container.resolve<UserService>(
        TOKENS.user.userService
      );

      return await userService.createOAuthUser({
        email: input.email,
        profile: input.profile ?? {},
      });
    },
  }
}