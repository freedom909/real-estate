// src/subgraphs/user/resolvers/index.ts
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
import { TOKENS } from "../../../shared/container/tokens.js";
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
    userById: (_, { id }: { id: string }, { container }: ResolverContext) =>
      container
        .resolve(TOKENS.user.userService)
        .findById(id),

    userByEmail: (_, { email }: { email: string }, { container }: ResolverContext) =>
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
    createOAuthUser: (_, { input }: { input: { email: string; profile: any } }, { container }: ResolverContext) => {
      console.log("🔥 USER SUBGRAPH RESOLVER HIT");
      console.log("resolver hit");
      const userService = container
        .resolve(TOKENS.user.userService);
      return userService.createOAuthUser(input);
    },
    deactivateUser: (_, { userId }: { userId: string }, { services }: ResolverContext) =>
      services.userService.deactivate(userId),
  },
}
