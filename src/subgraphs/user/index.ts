//src/subgraphs/user/index.ts
console.log("🔥🔥🔥 USER ENTRY STARTED 🔥🔥🔥");

import "dotenv/config";
import "reflect-metadata";

import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import mongoose from "../../shared/db/mongo.js";
import { connectMongo } from "../../shared/db/mongo.js";
import { createUserContainer } from "./container/user.container.js";
import resolvers from "./resolvers/index.js";

// 🔍 启动时验证 env
console.log(
  "BOOT USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);
// 🥭 1️⃣ Mongo
await connectMongo(
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/real_estate_user"
);

// 🧰 2️⃣ Container
const userContainer = createUserContainer();

// 🚀 3️⃣ App
const app = express();
const httpServer = http.createServer(app);

const typeDefs = gql(
  readFileSync(
    "./src/subgraphs/user/schema.graphql",
    "utf-8"
  )
);

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    { typeDefs, resolvers },
  ]),
});

await server.start();

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
        console.log("User received headers:", req.headers);
      const userHeader = req.headers["x-user"];

      if (userHeader) {
        console.log("🟢 x-user:", userHeader);
      }

      return {
        user: userHeader ? JSON.parse(userHeader as string) : null,
        container: userContainer,
      };
    },

  })
);

httpServer.listen(4020, () => {
  console.log(
    "👤 User 🔥🔥🔥 WHICH FILE IS THIS 🔥🔥🔥at http://localhost:4020/graphql"
  );
});