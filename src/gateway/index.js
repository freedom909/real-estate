import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";
import jwt from "jsonwebtoken";
import { authDirectiveTransformer } from "../shared/directives/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function decodeToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    console.error("JWT verify failed:", e.message);
    return null;
  }
}

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.user) {
      request.http.headers.set(
        "x-user",
        JSON.stringify(context.user)
      );
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4001/graphql" },
      { name: "user", url: "http://localhost:4002/graphql" },
      { name: "property", url: "http://localhost:4003/graphql" },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({ gateway,schemaTransforms: [authDirectiveTransformer], });

startStandaloneServer(server, {
  listen: { port: 4000 },
context: async ({ req }) => {
  const token = extractToken(req);
  if (!token) return {};

  try {
    const payload = verifyJwt(token);
    return { user: payload };
  } catch {
    return {};
  }
}

}).then(() => {
  console.log("🚀 Gateway running at http://localhost:4000/");
});
