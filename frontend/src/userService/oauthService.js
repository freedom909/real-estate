// frontend/src/userService/oauthService.js

const SUBGRAPH_AUTH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_AUTH_URL || 'http://localhost:4010/graphql';

class OAuthService {
  async oauthLogin({ provider, accessToken }) {
await fetch(SUBGRAPH_AUTH_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${account.access_token}`, // 👈 OAuth token
  },
  body: JSON.stringify({
    query: `
      mutation OAuthLogin($input: OAuthLoginInput!) {
        oauthLogin(input: $input) {
          success
          user {
            id
            role
          }
        }
      }
    `,
    variables: {
      input: {
        provider: "GOOGLE",
        providerAccountId: profile.sub, // 👈 必须传
      },
    },
  }),
});


    if (!res.ok) {
      throw new Error(`OAuth login failed: ${res.status}`);
    }

    const json = await res.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    return json.data.oauthLogin;
  }
}

export default new OAuthService();
