import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs from "fs";
import path from "path";
import resolvers from "./resolvers/property.resolver.js";
import { parse } from "graphql";

const typeDefs = parse(fs.readFileSync(
  path.join(process.cwd(), "src/subgraphs/property/schema.graphql"),
  "utf8"
));

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

startStandaloneServer(server, {
  listen: { port: 4003 },
context: async ({ req }) => {
  const body = req.body ?? {};
  const query = body.query ?? "";

  // federation 内部
  if (
    body.operationName === "IntrospectionQuery" ||
    query.includes("_service") ||
    query.includes("_entities")
  ) {
    return {};
  }

  const userHeader = req.headers["x-user"];
  const user = userHeader ? JSON.parse(userHeader) : null;

  return { user };
}

}).then(() => {
  console.log("🏠 Property subgraph running at http://localhost:4003/graphql");
});
