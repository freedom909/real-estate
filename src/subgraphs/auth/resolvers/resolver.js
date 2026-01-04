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
      context
    ) => {
      console.log('context keys:', Object.keys(context));
      console.log('context.container:', context.container);
      const authService = context.container.resolve(TOKENS.authService);
      return authService.oauthLoginWithIdToken(provider, idToken);
    },
  },
};

