import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const MOCK_USER = {
  id: "u1",
  email: "agent@test.com",
  role: "AGENT",
};

export default {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return MOCK_USER;
    },
  },

  Mutation: {
    login: (_, { email }) => {
      const token = jwt.sign(
        { userId: MOCK_USER.id, role: MOCK_USER.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return {
        accessToken: token,
        user: MOCK_USER,
      };
    },

    oauthLogin: () => {
      const token = jwt.sign(
        { userId: MOCK_USER.id, role: MOCK_USER.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return {
        accessToken: token,
        user: MOCK_USER,
      };
    },
  },

  User: {
    __resolveReference(ref) {
      return ref.id === MOCK_USER.id ? MOCK_USER : null;
    },
  },
};
