import jwt from "jsonwebtoken";

const MOCK_USER = {
  id: "u1",
  email: "agent@test.com",
  role: "AGENT",
};

 const resolvers = {
  Mutation: {
    login: (_, { email, password }) => {
      console.log("Login mutation called for:", email);
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
      try {
      const token = jwt.sign(
        { userId: MOCK_USER.id, role: MOCK_USER.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log("Token generated successfully", token);
      return { accessToken: token, user: MOCK_USER };
      } catch (error) {
        console.error("Login resolver error:", error);
        throw error;
      }
    },
    oauthLogin: (_, { input }) => {
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
      const token = jwt.sign(
        { userId: MOCK_USER.id, role: MOCK_USER.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      return { accessToken: token, user: MOCK_USER };
    },
  },
  User: {
    
    __resolveReference(userRef) {
      return userRef.id === MOCK_USER.id ? MOCK_USER : null;
    },
  },
};
export default resolvers;