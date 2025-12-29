import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs from "fs";
import path from "path";
import  resolvers  from "./resolvers/user.resolver.js";
import { parse } from "graphql";
const typeDefs = fs.readFileSync(
  path.join(process.cwd(), "src/subgraphs/user/schema.graphql"),
  "utf-8"
);
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // 指定路径
console.log("JWT_SECRET =", process.env.JWT_SECRET); // 先测试
const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs: parse(typeDefs), resolvers }]),
});

startStandaloneServer(server, {
  listen: { port: 4002 },
  context: async ({ req }) => {
    console.log("🔥 user-subgraph headers:", req.headers);
    const userHeader = req.headers["x-user"];
    console.log("🔥 user-subgraph x-user header:", userHeader);
    if (!userHeader) {
      return { user: null };
    }

    try {
      return {
        user: JSON.parse(userHeader),
      };
    } catch {
      return { user: null };
    }
  },
}).then(({ url }) => {
  console.log(`🧑 User subgraph running at ${url}`);
});
