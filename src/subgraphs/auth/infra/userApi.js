// src/subgraphs/auth/infra/userApi.js
import fetch from "node-fetch";

const USER_SUBGRAPH_URL =
  process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql";

async function findOrCreateByOAuth({ provider, providerUserId, email }) {
  const res = await fetch(USER_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
        input: { provider, providerUserId, email },
      },
    }),
  });

  const text = await res.text();

  // 1️⃣ HTTP 层错误（连 GraphQL 都没进）
  if (!res.ok) {
    const err = new Error("USER_SUBGRAPH_HTTP_ERROR");
    err.source = "USER_SUBGRAPH_HTTP";
    err.status = res.status;
    err.responseBody = text;
    throw err;
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    const err = new Error("USER_SUBGRAPH_INVALID_JSON");
    err.source = "USER_SUBGRAPH_HTTP";
    err.responseBody = text;
    throw err;
  }

  // 2️⃣ GraphQL 业务错误（来自 user subgraph）
  if (json.errors?.length) {
    const gqlErr = json.errors[0];

    const err = new Error(gqlErr.message);
    err.source = "USER_SUBGRAPH_GRAPHQL";
    err.graphQLErrors = json.errors;
    err.extensions = gqlErr.extensions;

    throw err;
  }

  // 3️⃣ 正常成功
  return json.data.findOrCreateByOAuth;
}

export default { findOrCreateByOAuth };
