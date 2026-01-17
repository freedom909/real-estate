// src/gateway/cookies/index.ts
import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@as-integrations/express4'
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";
import { authCookiePlugin } from "./plugins/authCookiePlugin.js";
import { authDirectiveTransformer } from "../shared/directives/auth.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import verifyJwt from "../infrastructure/auth/verifyJwt.js";
import AuthenticatedDataSource from "../infrastructure/auth/authenticatedDataSource.js";
import extractToken from "../infrastructure/auth/extractToken.js";
import authCookieInterceptor from "./cookies/authCookieInterceptor.js";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";


/**
 * 给 subgraph 注入 user 信息
 */


const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4010/graphql" },
      { name: "user", url: "http://localhost:4020/graphql" },
      // { name: "property", url: "http://localhost:4030/graphql" },
    ],
  }),

  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({
  gateway,
  schemaTransforms: [authDirectiveTransformer],
  plugins: [authCookiePlugin()],
});

await server.start();
const app = express();
const httpServer = http.createServer(app);
app.use(
  "/graphql",

  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),

  cookieParser(),
  express.json(),

  // ✅ 1️⃣ 必须在 expressMiddleware 之前
  authCookieInterceptor,

  // ✅ 2️⃣ 最后才是 Apollo
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token =
        req.cookies?.access_token || extractToken(req);

      let user = null;
      if (token) {
        try {
          const payload = verifyJwt(token);
          user = { userId: payload.sub };
        } catch {}
      }

      return { user, res };
    },
  })
);



httpServer.listen(4000, () => {
  console.log(`🚀 Gateway running at http://localhost:4000/graphql`);
});
