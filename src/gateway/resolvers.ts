// gateway/resolvers.ts

interface Args {
  // Define the structure of args based on your GraphQL mutation
  // For example:
  // email: string;
  // password: string;
}

interface Context {
  res: any;
  authClient: any;
}

interface Result {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export default {
  Mutation: {
    oauthLogin: async (_, args: Args, { res, authClient }: Context): Promise<Result> => {
      const result = await authClient.oauthLogin(args);

      // Assuming the result contains accessToken, refreshToken, and userId
      // You might need to adjust this based on the actual structure of 'result'
      const { accessToken, refreshToken, userId } = result;
      
      return {
        accessToken,
        refreshToken, // 👈 明确返回
        userId
      };
    },
  },
};