// // src/subgraphs/auth/resolvers/resolver.js
// import { GraphQLError } from "graphql";
// import { TOKENS } from "../../../shared/container/tokens.js";


// src/subgraphs/auth/resolvers/resolver.js
import { TOKENS } from "../../../shared/container/tokens.js";



export default {
  Mutation: {
    oauthLoginWithIdToken: async (
      _,
      { provider, idToken },
      { container }
    ) => {
      const authService = container.resolve(TOKENS.authService);

      // ⚠️ 这里是关键：传两个参数，不要包成对象
      return authService.oauthLoginWithIdToken({provider, idToken});
    },
  },
};

