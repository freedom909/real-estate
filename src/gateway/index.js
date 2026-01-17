// src/gateway/index.ts
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import {
  ApolloGateway,
  IntrospectAndCompose,
} from "@apollo/gateway";

import { authCookiePlugin } from "./plugins/authCookiePlugin.js";
import { authDirectiveTransformer } from "../shared/directives/auth.js";
import AuthenticatedDataSource from "../infrastructure/auth/authenticatedDataSource.js";
import extractToken from "../infrastructure/auth/extractToken.js";
import verifyJwt from "../infrastructure/auth/verifyJwt.js";

const app = express();
const httpServer = http.createServer(app);

/** ✅ 1️⃣ CORS 必须最先 */
app.use(
  cors({
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  })
);

/** ✅ 2️⃣ cookie parser */
app.use(cookieParser());

/** ✅ 3️⃣ body parser */
app.use(express.json());

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4010/graphql" },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({
  gateway,
  plugins: [authCookiePlugin()],
});

await server.start();

/** ✅ 4️⃣ Apollo Gateway */
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      console.log("🔐 Gateway req.cookies:", req.cookies);
      console.log("🔐 Gateway req.headers.cookie:", req.headers.cookie);

      const token =
        req.cookies?.access_token || extractToken(req);

      let user = null;
      if (token) {
        try {
          const payload = verifyJwt(token);
          user = { userId: payload.sub };
        } catch {}
      }

      return { user, req, res };
    }
  }) 
);

httpServer.listen(4000, () => {
  console.log("🚀 Gateway running at http://localhost:4000/graphql");
});
