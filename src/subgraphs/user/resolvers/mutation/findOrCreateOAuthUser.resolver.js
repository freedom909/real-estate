// subgraphs/user/resolvers/mutation/findOrCreateOAuthUser.resolver.js
import { TOKENS } from "../../../shared/container/tokens.js";

export default {
  Mutation: {
    findOrCreateOAuthUser: async (
      _,
      { input },
      { container }
    ) => {
      const userService = container.resolve(
        TOKENS.userService
      );

      return userService.findOrCreateOAuthUser(
        input
      );
    },
  },
};
