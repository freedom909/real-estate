export default {
  Mutation: {
    findOrCreateOAuthUser: async (_, { input }, { container }) => {
      const oauthService = container.resolve("oauthService");

      const userId = await oauthService.findOrCreateOAuthUser(input);

      return {
        userId,
        email: input.email,
      };
    },
  },
};
