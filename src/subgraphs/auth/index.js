import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@as-integrations/express4';
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import bodyParser from "body-parser";
import cors from "cors";
import resolvers from "../auth/resolvers/resolver.js";
import { createAuthContainer } from "../auth/container/auth.container.js";
import userApi from "../auth/infra/userApi.js";
import RefreshTokenRepo from "../auth/repos/refresh-token.repo.js";
import cookieParser from "cookie-parser";
const refreshTokenRepo = new RefreshTokenRepo();
const authContainer = createAuthContainer({  userApi,
  refreshTokenRepo});

const app = express();
const httpServer = http.createServer(app);
const typeDefs = gql(readFileSync('./src/subgraphs/auth/schema.graphql', { encoding: 'utf-8' }));//path is relative to the root of the project

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

await server.start();

app.use(express.json());
app.use(cookieParser());
app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      req,
      res,
      container: authContainer,
    }),
  })
);


httpServer.listen(4010, () => {
  console.log("🔐 Auth subgraph running at http://localhost:4010/graphql");
});
