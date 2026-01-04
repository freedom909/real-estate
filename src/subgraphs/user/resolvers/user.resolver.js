
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
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

     findOrCreateByOAuth: async (_, { input }, context) => {
      try {
        return await context.userService.findOrCreateByOAuth(input);
      } catch (err) {
        if (err.code === "DUPLICATE_USER") {
          throw new GraphQLError("User already exists", {
            extensions: {
              code: ERROR_CODES.USER_ALREADY_EXISTS,
            },
          });
        }

        throw new GraphQLError("User service failed", {
          extensions: {
            code: ERROR_CODES.INTERNAL_SERVICE_ERROR,
          },
        });
      }
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