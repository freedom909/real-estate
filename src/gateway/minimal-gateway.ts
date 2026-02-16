// src/gateway/minimal-gateway.ts
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
import { RemoteGraphQLDataSource } from "@apollo/gateway";

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4010/graphql" },
      { name: "user", url: "http://localhost:4020/graphql" },
      { name: "property", url: "http://localhost:4030/graphql" },
    ],
  }),
  buildService({ name, url }: { name: string; url: string }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }: { request: any; context: any }) {
        if (!context?.req?.headers?.cookie) return;
        request.http.headers.set(
          "cookie",
          context.req.headers.cookie
        );
      },
    });
  }
});

const server = new ApolloServer({
  gateway,
  // Remove the authCookiePlugin for now
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }: { req: any; res: any }) => {
      return { req, res };
    }
  })
);

httpServer.listen(4000, () => {
  console.log("🚀 Minimal Gateway running at http://localhost:4000/graphql");
});