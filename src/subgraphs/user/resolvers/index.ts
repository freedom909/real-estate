// src/subgraphs/user/resolvers/index.ts

import { TOKENS } from "../../../shared/container/tokens";
import { IUser } from "../models/user.model.js";

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
    userById: (_:unknown, { id }: { id: string }, { container }: ResolverContext) =>
      container
        .resolve(TOKENS.user.userService)
        .findById(id),

    userByEmail: (_:unknown, { email }: { email: string }, { container }: ResolverContext) =>
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
    createOAuthUser: (_:unknown, { input }: { input: { email: string; profile: any } }, { container }: ResolverContext) => {
      console.log("🔥 USER SUBGRAPH RESOLVER HIT");
      console.log("resolver hit");
      const userService = container
        .resolve(TOKENS.user.userService);
      return userService.createOAuthUser(input);
    },
    deactivateUser: (_:unknown, { userId }: { userId: string }, { services }: ResolverContext) =>
      services.userService.deactivate(userId),
  },
}
