// src/subgraphs/user/resolvers/index.js
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";
import { TOKENS } from "../../../shared/container/tokens.js";

const resolvers = {
  Query: {
    userById: () => ({
      id: "1",
      email: "test@test.com",
      profile: { name: "a", avatar: "b" },
      role: "ADMIN",
      accountStatus: "ACTIVE",
      approvalStatus: "NONE",
      tokenVersion: 1,
      createdAt: new Date().toISOString(),
    }),
  },
};


export default resolvers;