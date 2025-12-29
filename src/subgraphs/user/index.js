import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs from "fs";
import path from "path";
import  resolvers  from "./resolvers/user.resolver.js";
import { parse } from "graphql";
import { authDirectiveTransformer } from "../../shared/directives/auth.js";

const typeDefs = parse(fs.readFileSync(
  path.join(process.cwd(), "src/subgraphs/user/schema.graphql"),
  "utf-8"
));
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // 指定路径
console.log("JWT_SECRET =", process.env.JWT_SECRET); // 先测试

let schema = buildSubgraphSchema([
  { typeDefs, resolvers },
]);
const transformedSchema = authDirectiveTransformer(schema);
const server = new ApolloServer({ schema: transformedSchema });

startStandaloneServer(server, {
  listen: { port: 4002 },
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

}).then(({ url }) => {
  console.log(`🧑 User subgraph running at ${url}`);
});
