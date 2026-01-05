
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
import { TOKENS } from "../../../shared/container/tokens.js";
const resolvers = {
  Query: {
    me: (_, __, context) => {
      console.log("🔥 user-subgraph context.user:", context.user);

      if (!context.user) {
        throw new Error("Unauthorized");
      }

      return {
        id: context.user.userId,
        email: "agent@test.com",
        role: context.user.role,
      };
    },
  },
  Mutation: {
    logout: (_, __, context) => {
      context.res.clearCookie("rt");
      return true;
    },
  },
  User: {
    __resolveReference(ref, { container }) {
      const repo = container.resolve(TOKENS.userRepository);
      return repo.findById(ref.id);
    },
  }
};
export default resolvers;