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

/**
 * 从 Authorization header 中提取 token
 */
function extractToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;

  if (auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * 给 subgraph 注入 user 信息
 */
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
});

startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req }) => {
    const token = extractToken(req);
    if (!token) return {};

    try {
      const payload = verifyJwt(token);
      return {
        user: {
          userId: payload.sub ?? payload.userId,
        },
      };
    } catch (e) {
      console.error("JWT verify failed:", e.message);
      return {};
    }
  },
}).then(({ url }) => {
  console.log(`🚀 Gateway running at ${url}`);
});
