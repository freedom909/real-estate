// src/subgraphs/user/resolvers/index.js
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
import { TOKENS } from "../../../shared/container/tokens.js";

export default {
  
Query: {
    userById: (_, { id }, { container }) =>
      container
        .resolve(TOKENS.user.userService)
        .findById(id),

    userByEmail: (_, { email }, { container }) =>
      container
        .resolve(TOKENS.user.userService)
        .findByEmail(email),
  },

User: {
  __resolveReference: async (ref, { container }) => {
    const userRepo = container.resolve(TOKENS.user.userRepo);
    return userRepo.findById(ref.id);
  },
async __resolveReference(ref, { container }) {
  const userRepo = container.resolve(TOKENS.user.userRepo);
  return userRepo.findById(ref.id);
}

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
