// gateway/resolvers.ts
export default {
    Mutation: {
        oauthLogin: async (_, args, { res, authClient }) => {
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
