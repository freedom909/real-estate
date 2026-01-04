// src/subgraphs/auth/adapters/user-api.adapter.js
import fetch from "node-fetch";

const USER_SUBGRAPH_URL =
  process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql";

export default class UserApiAdapter {
  async findOrCreateByOAuth(oauthUser) {
    try {
      const res = await fetch(USER_SUBGRAPH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation ($input: OAuthUserInput!) {
              findOrCreateByOAuth(input: $input) {
                id
                email
                role
              }
            }
          `,
          variables: {
            input: {
              provider: oauthUser.provider,
              providerUserId: oauthUser.providerUserId,
              email: oauthUser.email,
            },
          },
        }),
      });

      // ❌ HTTP 层错误（400 / 500 / 502 等）
      if (!res.ok) {
        const text = await res.text();
        const err = new Error(
          `User subgraph HTTP error: ${res.status}`
        );
        err.status = res.status;
        err.responseBody = text;
        err.source = "USER_SUBGRAPH_HTTP";
        throw err;
      }

      const json = await res.json();

      // ❌ GraphQL errors
      if (json.errors && json.errors.length > 0) {
        const err = new Error(json.errors[0].message);
        err.graphQLErrors = json.errors;
        err.source = "USER_SUBGRAPH_GRAPHQL";
        throw err;
      }

      return json.data.findOrCreateByOAuth;
    } catch (err) {
      // ❌ 网络 / fetch 本身错误
      err.source = err.source || "USER_SUBGRAPH_FETCH";
      throw err;
    }
  }
}
