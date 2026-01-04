// auth/infra/userApi.js
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../../../shared/errors/errorCodes.js";

import fetch from "node-fetch";
const USER_SUBGRAPH_URL = process.env.USER_SUBGRAPH_URL || 'http://localhost:4020/graphql'; // Default to user subgraph URL

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`User subgraph HTTP error: ${res.status} ${text}`);
  }

  const json = await res.json();

if (json.errors?.length) {
  const err = json.errors[0];
  const code = err.extensions?.code;

  throw new GraphQLError(
    mapMessage(code),
    {
      extensions: { code },
    }
  );
}

function mapMessage(code) {
  switch (code) {
    case "USER_ALREADY_EXISTS":
      return "Account already exists";

    case "USER_NOT_FOUND":
      return "User not found";

    default:
      return "Authentication service unavailable";
  }
}
  // ✅ 这里才是真正的 user
  return json.data.findOrCreateByOAuth;
}
export default { findOrCreateByOAuth };
