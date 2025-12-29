import jwt from "jsonwebtoken";

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
};
export default resolvers;