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
import redis from "../../infrastructure/redis/redis.js";
import { createAuthContainer } from './container/auth.container.js'
import resolvers from './resolvers/resolver.js'
import mongoose from 'mongoose'
import { userApolloClient } from "../../infrastructure/userApolloClient.js";
await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/water_auth"
);
console.log(
  "BOOT (AUTH) USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);
// ⭐⭐⭐ 核心：创建 DI 容器实例（一次）
const container = createAuthContainer({
  redis,
  userApolloClient,// TODO: Inject Redis client here
});
const typeDefs = gql(readFileSync('./src/subgraphs/auth/schema.graphql', { encoding: 'utf-8' }));

let schema;
try {
  console.log('Attempting to build subgraph schema...');
  schema = buildSubgraphSchema({ typeDefs, resolvers });
  console.log('✅ Subgraph schema built successfully.');
} catch (schemaError) {
  console.error('❌ Fatal error building subgraph schema:', schemaError);
  // Log the full error details, which are often very helpful for federation issues.
  console.error(JSON.stringify(schemaError, null, 2));
  process.exit(1); // Exit if schema is invalid, as the server cannot run.
}

const server = new ApolloServer({
  schema,
});

await server.start();
const app = express();
const httpServer = http.createServer(app);
app.use(
  "/graphql",
  cors({ origin: "http://localhost:3000", credentials: true }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, {
    context: async ({ req,res }) => ({
      req,
      res,
      container,
      user:req.user??null,
    }),
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.method === "POST") {
    const csrfHeader = req.headers["x-csrf-token"];
    const csrfCookie = req.cookies?.csrf_token;
    console.log("🔐 Auth req.cookies:", req.cookies);

    if (!csrfHeader || csrfHeader !== csrfCookie) {
      return res.status(403).json({ error: "CSRF validation failed" });
    }
  }
  next();
});

httpServer.listen(4010, () => {
  console.log("🔐 Auth subgraph running at http://localhost:4010/graphql");
});