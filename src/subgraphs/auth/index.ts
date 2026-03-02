//src/subgraphs/auth/index.ts
import "reflect-metadata"
import "dotenv/config";
import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { createRedis } from "../../infrastructure/redis/redis.js";
import  createAuthContainer  from './container/auth.container.js'
import resolvers from './resolvers/resolver.js'
import mongoose from 'mongoose'
import { userApolloClient } from "../../infrastructure/userApolloClient.js";
import { GraphQLError } from "graphql";

const redis = createRedis();

await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/water_auth"
);

console.log(
  "BOOT (AUTH) USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);

// ⭐⭐⭐ 核心：创建 DI 容器实例（一次）
const container = createAuthContainer();

const typeDefs = gql(readFileSync('./src/subgraphs/auth/schema.graphql', { encoding: 'utf-8' }));

let schema;
try {
  console.log('Attempting to build subgraph schema...');
  schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
  console.log('✅ Subgraph schema built successfully.');
} catch (schemaError) {
  console.error('❌ Fatal error building subgraph schema:', schemaError);
  // Log the full error details, which are often very helpful for federation issues.
  console.error(JSON.stringify(schemaError, null, 2));
}

const server = new ApolloServer({
  schema,
});

await server.start();
const app = express();
const httpServer = http.createServer(app);

app.use(cookieParser());

interface CustomRequest extends express.Request {
  user?: any;
}

app.use((req: CustomRequest, res, next) => {
  if (req.method === "POST" && req.path === "/graphql") {
    const query = req.body?.query ?? "";

    const isMutation = query.trim().startsWith("mutation");
    const isLogin = query.includes("oauthLogin");

    if (isMutation && !isLogin) {
      const csrfHeader = req.headers["x-csrf-token"];
      const csrfCookie = req.cookies?.csrf_token;

      if (!csrfHeader || csrfHeader !== csrfCookie) {
        return next(
          new GraphQLError("CSRF validation failed", {
            extensions: { code: "FORBIDDEN" },
          })
        );
      }

    }
  }
console.log("Subgraph Authorization:", req.headers.authorization);
  next();
});


app.use(
  "/graphql",
  cors({ origin: "http://localhost:3000", credentials: true }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      
      req,
      res,
      container,
      redis,
      user: req.user ?? null,
    }),
    
  })
  
);


httpServer.listen(4010, () => {
  console.log("🔐 Auth subgraph running at http://localhost:4010/graphql");
});