// gateway/resolvers.js
import { setAuthCookies } from "../infrastructure/auth/setAuthCookies.js";
import { OAUTH_LOGIN } from "./graphql/auth.mutations.js";
export default {
  Mutation: {
  oauthLogin: async (_, args, { res, authClient }) => {
    const result = await authClient.oauthLogin(args);

    

    return  {
    accessToken,
    refreshToken, // 👈 明确返回
    userId
  };
  },

}}
