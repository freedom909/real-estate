// src/subgraphs/user/resolvers/index.js
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
import { TOKENS } from "../../../shared/container/tokens.js";

export default {
  
  Query: {
  

    me: async (_, __, { user, container }) => {
      if (!user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: ERROR_CODES.UNAUTHORIZED },
        });
      }

      const repo = container.resolve(TOKENS.userRepository);// no the layer of userService?
      return repo.findById(user.userId);
    },

    userByEmail: async (_, { email }, { container }) => {
        console.log("🔥 USER SUBGRAPH RESOLVER HIT");
      const userService = container.resolve(
        TOKENS.user.userService
      );
      return userService.findByEmail(email);
    },

    user: async (_, { userId }, { container }) => {
      return container
        .resolve(TOKENS.user.userService)
        .findById(userId);
    },
    userById: (_, { id }, { services }) =>
      services.userService.findById(id),
  },

  User: {
    __resolveReference: async (ref, { container }) => {
        console.log("🔥 USER SUBGRAPH RESOLVER HIT");
      const repo = container.resolve(TOKENS.userRepository);
      return repo.findById(ref.userId);
    },
   email: (user) => user.email
  },
  Mutation: {
    createOAuthUser: (_, { input }, { container }) =>{
        console.log("🔥 USER SUBGRAPH RESOLVER HIT");
     console.log("resolver hit");
      const userService = container
        .resolve(TOKENS.user.userService)
      return userService.createOAuthUser(input)
    },
    deactivateUser: (_, { userId }, { services }) =>
      services.userService.deactivate(userId),
  },
}
