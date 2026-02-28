// frontend/src/services/oauthService.js

const GATEWAY_URL = "http://localhost:4000/graphql";

class OAuthService {
  constructor() {
    this.accessToken = null;

    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
    }
  }

  /**
   * 🔐 OAuth login via Auth Subgraph (Gateway)
   * Google / Github / Apple → ID Token
   */
  async oauthLogin({ provider, idToken }) {
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔐 receive refresh_token cookie
      body: JSON.stringify({
        query: `
          mutation OAuthLogin($provider: OAuthProvider!, $idToken: String!) {
            oauthLogin(provider: $provider, idToken: $idToken) {
              accessToken
              user {
                id
              }
            }
          }
        `,
        variables: {
          provider: provider.toUpperCase(),
          idToken,
        },
      }),
    });

    const result = await res.json();

    if (result.errors) {
      console.error("OAuth login failed:", result.errors);
      throw new Error(result.errors[0].message);
    }

    const { accessToken } = result.data.oauthLogin;

    // ✅ Store new Real-Estate access token
    localStorage.setItem("access_token", accessToken);
    this.accessToken = accessToken;

    return result.data.oauthLogin;
  }

  /**
   * Attach token to GraphQL / REST calls
   */
  getAuthHeader() {
    if (!this.accessToken) return {};
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  logout() {
    localStorage.removeItem("access_token");
    this.accessToken = null;
  }
}

// ✅ Singleton
export default new OAuthService();
