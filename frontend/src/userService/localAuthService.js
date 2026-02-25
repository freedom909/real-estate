//frontend/src/userService/localAuthService.js

import axios from "axios";

const SUBGRAPH_AUTH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_AUTH_URL ||
  "http://localhost:4010/graphql";

const loginRequestToSubgraph = `
mutation SignIn($input: SignInInput!) {
  signIn(input: $input) {
    auth {
      role
      token
      userId
    }
    refreshToken
    success
    code
    message
  }
}
`;

const registerRequestToSubgraph = `
mutation Register($input: SignUpInput!) {
  signUp(input: $input) {
    role
    userId
    code
    message
    refreshToken
    success
    auth {
      token
    }
  }
}
`;

const localAuthService = {
  /**
   * Used by NextAuth Credentials authorize()
   * ❗ MUST be server-safe (no alert / no localStorage)
   */
  async authenticate(email, password) {
    // 1️⃣ basic validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    try {
      // 2️⃣ call subgraph
      const response = await axios.post(SUBGRAPH_AUTH_URL, {
        query: loginRequestToSubgraph,
        variables: { input: { email, password } },
      });

      // 3️⃣ GraphQL errors
      if (response.data.errors?.length) {
        throw new Error(response.data.errors[0].message);
      }

      const signIn = response.data?.data?.signIn;
      if (!signIn || !signIn.success) {
        throw new Error(signIn?.message || "Invalid credentials");
      }

      const { auth } = signIn;
      if (!auth?.token || !auth?.userId) {
        throw new Error("Invalid auth payload");
      }

      // 4️⃣ return user object for NextAuth
      return {
        id: auth.userId,
        email,
        role: auth.role,
        accessToken: auth.token,
      };
    } catch (err) {
      console.error("Authentication error:", err.message);
      throw err; // ✅ let NextAuth handle failure
    }
  },

  async register(data) {
    return this.sendRegisterToSubgraph(data);
  },

  async sendRegisterToSubgraph(data) {
    try {
      const response = await fetch(SUBGRAPH_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: registerRequestToSubgraph,
          variables: { input: data },
        }),
      });

      const result = await response.json();

      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }

      return {
        success: result.data.signUp.success,
        userId: result.data.signUp.userId,
        token: result.data.signUp.auth?.token || null,
        message: result.data.signUp.message,
      };
    } catch (err) {
      console.error("Registration failed:", err.message);
      return { success: false, error: err.message };
    }
  },
};

export default localAuthService;
