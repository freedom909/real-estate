// src/subgraphs/user/resolvers/index.ts

import { Action, Resource } from "../../../shared/types/types";
import { TOKENS } from "../../../shared/container/tokens";
import { IUserDB } from "../models/user.model.js";
import { ForbiddenError } from "@/infrastructure/utils/errors";

interface ResolverContext {
  container: any;
  services: any;
  user?: any;
}

interface UserReference {
  id: string;
  __typename?: string;
}

export default {

  Query: {
    userById: async (_: unknown, { id }: { id: string }, { container, user }: ResolverContext) => {
      const policyEngine = container.resolve(TOKENS.security.policyEngine);
      const userService = container.resolve(TOKENS.user.userService);

      const targetUser = await userService.findById(id);

      if (targetUser) {
        return null
      }

      const policyContext = {
        user: user ? { id: user.id, role: user.role } : undefined,
        resourceOwnerId: targetUser.id
      }
      const allowed = policyEngine.can(Action.READ,
        Resource.USER, {
        user: policyContext.user ?? undefined,
        resourceOwnerId: targetUser.id
      })
      if (!allowed) {
         throw new ForbiddenError("Access denied");
      }
      return targetUser;
    },


    userByEmail: (_: unknown, { email }: { email: string }, { container }: ResolverContext) =>
      container
        .resolve(TOKENS.user.userService)
        .findByEmail(email),
  },

  User: {

    async __resolveReference(ref: UserReference, { container }: ResolverContext) {
      const userService = container.resolve(TOKENS.user.userService);
      return userService.findById(ref.id);
    }
  },

  Mutation: {
    createOAuthUser: (_: unknown, { input }: { input: { email: string; profile: any } }, { container }: ResolverContext) => {
      console.log("🔥 USER SUBGRAPH RESOLVER HIT");
      console.log("resolver hit");
      const userService = container
        .resolve(TOKENS.user.userService);
      return userService.createOAuthUser(input);
    },
    deactivateUser: (_: unknown, { userId }: { userId: string }, { services }: ResolverContext) =>
      services.userService.deactivate(userId),
  },
}
