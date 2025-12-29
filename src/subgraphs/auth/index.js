import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // 指定路径
console.log("JWT_SECRET =", process.env.JWT_SECRET); // 先测试
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { startStandaloneServer } from "@apollo/server/standalone";
import fs from "fs";
import path from "path";
import resolvers from "./resolvers/resolver.js";
console.log("Resolvers loaded:", resolvers);
import jwt from "jsonwebtoken";

// 读取 schema

import { parse } from "graphql";
const typeDefs = parse(fs.readFileSync(path.join(process.cwd(), "src/subgraphs/auth/schema.graphql"), "utf-8"));

const server = new ApolloServer({ schema: buildSubgraphSchema({ typeDefs, resolvers }) });

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4001 },
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return {};

    const token = authHeader.replace("Bearer ", "");
    try {
        console.log("JWT_SECRET =", process.env.JWT_SECRET);
      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      return {
        user: {
          id: payload.userId,
          role: payload.role,
          email: "agent@test.com",
          phone: "999999",
        },
      };
    } catch {
      return {};
    }
  },
});

console.log(`🚀 Auth subgraph running at ${url}`);
