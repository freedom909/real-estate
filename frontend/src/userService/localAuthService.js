import axios from "axios";

const SUBGRAPH_USERS_URL = "http://localhost:4010/graphql"; // ✅ point directly to /graphql

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
  async authenticate(email, password) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (!password || password.trim() === "") {
        throw new Error("Password is required");
      }

      const response = await axios.post(SUBGRAPH_USERS_URL, {
        query: loginRequestToSubgraph,
        variables: { input: { email, password } },
      });

      const result = response.data;
      if (!result.success) {
        alert(result.error || "Login failed");
        return; // stop navigation
      }
      // 1. If GraphQL has errors
      if (result.errors) {
        throw new Error(result.errors[0].message || "Authentication failed");
      }

      if (!result.data || !result.data.signIn) {
        throw new Error("Invalid credentials");
      }
      const { user, token, success } = result.data.signIn;
      if (!success || !user || !token?.accessToken?.token) {
        throw new Error("Invalid email or password");
      }

      // Save token
      localStorage.setItem("jwt_token", token.accessToken.token);

      if (token?.accessToken?.token) {
        localStorage.setItem("jwt_token", token.accessToken.token);
      }

      return {
        success: true,
        user,
        token: token.accessToken.token,
        message: "Authentication successful",
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: error.message || "Authentication failed",
        message: "Authentication failed",
      };
    }
  },

  async register(data) {
    console.log("➡️ calling register()");
    return await this.sendRegisterToSubgraph(data);
  },

  async sendRegisterToSubgraph(data) {
    try {
      const response = await fetch(SUBGRAPH_USERS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: registerRequestToSubgraph,
          variables: {
            input: {
              email: data.email,
              password: data.password,
              name: data.name,
              nickname: data.nickname,
              role: data.role,
              picture: data.picture,
            },
          },
        }),
      });

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("非JSON响应:", text);
        return {
          success: false,
          error: "Server response is not valid JSON",
        };
      }

      if (!response.ok || result.errors) {
        const errorMessage = result?.errors?.[0]?.message || `HTTP Error ${response.status}`;
        console.error("GraphQL error:", errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: result.data.signUp.success,
        userId: result.data.signUp.userId,
        message: result.data.signUp.message,
        token: result.data.signUp.auth?.token || null,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.message || "Registration error",
      };
    }
  },
};

export default localAuthService;
