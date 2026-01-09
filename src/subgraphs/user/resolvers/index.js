//src/subgraphs/user/resolvers/index.js
import { TOKENS } from "../../../shared/container/tokens.js";

export default {
  Query: {
    user: (_, { userId }, { container }) =>
      container.userService.findById(
        userId
      ),
  },

  Mutation: {
    findOrCreateOAuthUser: (
      _,
      { input },
      { container }
    ) =>
      container.resolve(TOKENS.userService).findOrCreateOAuthUser(
        input
      ),
  },
};
