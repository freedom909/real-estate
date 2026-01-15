// adapters/user-subgraph.client.js
import { GraphQLClient } from "graphql-request";

export function createUserSubgraphClient() {
  const url = process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql";

  if (!url) {
    throw new Error("USER_SUBGRAPH_URL is not defined");
  }

  return new GraphQLClient(url, {
    headers: {
      "content-type": "application/json",
    },
  });
}
