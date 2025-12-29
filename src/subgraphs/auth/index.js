import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { parse } from "graphql";
import resolvers from "./resolvers/resolver.js";
import { authDirectiveTransformer } from "../../shared/directives/auth.js";

console.log("JWT_SECRET =", process.env.JWT_SECRET);

// 读取 schema
const typeDefs = parse(
  fs.readFileSync(
    path.join(process.cwd(), "src/subgraphs/auth/schema.graphql"),
    "utf8"
  )
);

// 构建 subgraph schema
let schema = buildSubgraphSchema([{ typeDefs, resolvers }]);


// 创建 server
const server = new ApolloServer({
  schema,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4001 },

context: async ({ req }) => {
  // Check for x-user header (from Gateway)
  if (req.headers["x-user"]) {
    try {
      return { user: JSON.parse(req.headers["x-user"]) };
    } catch {
      return { user: null };
    }
  }

  // Check for Authorization header (Direct access)
  const auth = req.headers.authorization;
  if (auth) {
    try {
      const user = jwt.verify(
        auth.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );
      return { user };
    } catch {
      return { user: null };
    }
  }

  return { user: null };
}

});

console.log(`🚀 Auth subgraph running at ${url}`);
