const resolvers = {
  Mutation: {
    login: async (_, { email, password }) => {
      // TODO: Replace with actual authentication logic
      return {
        accessToken: "mock-token",
        user: {
          id: "user-1", // Essential for Federation @key
          email,
          role: "USER",
        },
      };
    },
    oauthLogin: async (_, { input }) => {
      return {
        accessToken: "mock-oauth-token",
        user: {
          id: "user-2",
          email: "oauth@example.com",
          role: "USER",
        },
      };
    },
  },
};

export default resolvers;