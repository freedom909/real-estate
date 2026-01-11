// src/infrastructure/userApi.js
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
    const err = new Error(`USER_SUBGRAPH_HTTP_ERROR: ${res.status} - ${text}`);
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

async function findUserByEmail(email) {
  const res = await fetch(USER_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query ($email: String!) {
          findUserByEmail(email: $email) {
            id
            email
            role
          }
        }
      `,
      variables: { email },
    }),
  });

  const text = await res.text();

  // Handle 404 from subgraph (if it returns 404 for not found)
  if (res.status === 404) return null;

  if (!res.ok) {
    let errMsg = `USER_SUBGRAPH_HTTP_ERROR: ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json.errors?.[0]?.message) errMsg += ` - ${json.errors[0].message}`;
      else errMsg += ` - ${text}`;
    } catch {
      errMsg += ` - ${text}`;
    }
    const err = new Error(errMsg);
    err.source = "USER_SUBGRAPH_HTTP";
    err.status = res.status;
    err.responseBody = text;
    throw err;
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // Ignore JSON parse error here, let caller handle or throw specific
  }

  return json?.data?.findUserByEmail || null;
}

async function createUser(input) {
  const res = await fetch(USER_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation ($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
            role
          }
        }
      `,
      variables: { input },
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error("USER_SUBGRAPH_HTTP_ERROR: " + res.status);
  }

  const json = JSON.parse(text);
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.createUser;
}

export default { findOrCreateByOAuth, findUserByEmail, createUser };
