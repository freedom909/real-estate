// src/subgraphs/auth/index.js
import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";

import resolvers from "./resolvers/resolver.js";
import { createAuthContainer } from "./container/auth.container.js";
import redis from "../../shared/redis/redis.client.js";
import userApi from "./infra/userApi.js";

const app = express();
const httpServer = http.createServer(app);

const typeDefs = gql(
  readFileSync(
    "./src/subgraphs/auth/schema.graphql",
    "utf-8"
  )
);

const authContainer = createAuthContainer({
  redis,
  userApi,
});

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

await server.start();

app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, {
    context: ({ req, res }) => ({
      req,
      res,
      container: authContainer,
    }),
  })
);

httpServer.listen(4010, () => {
  console.log(
    "🔐 Auth subgraph running at http://localhost:4010/graphql"
  );
});
