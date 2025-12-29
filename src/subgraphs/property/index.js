import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "graphql";
import resolvers from "./resolvers/property.resolver.js";

// ✅ ESM 下手动构造 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 读取 schema.graphql 并解析为 AST
const typeDefs = parse(fs.readFileSync(
  path.join(__dirname, "./schema.graphql"),
  "utf8"
));
const schema = buildSubgraphSchema([
  {
    typeDefs,
    resolvers,
  },
]);

const server = new ApolloServer({
  schema,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4003 },
});

console.log(`🏠 Property subgraph running at ${url}`);
