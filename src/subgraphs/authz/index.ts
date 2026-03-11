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

import resolvers from './resolvers.js'
import mongoose from 'mongoose'
import { container } from 'tsyringe'
import { userApolloClient } from "../../infrastructure/userApolloClient.js";
import  registerAuthDependencies  from "./container";


await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/water_au"
);
console.log(
  "BOOT (AUTH) USER_SUBGRAPH_URL =",process.env.USER_SUBGRAPH_URL
);
// ⭐⭐⭐ 核心：创建 DI 容器实例（一次）

const typeDefs = gql(readFileSync('./src/subgraphs/authz/schema.graphql', { encoding: 'utf-8' }));
registerAuthDependencies(container);

let schema;
try {
  console.log('Attempting to build subgraph schema...');
  schema = buildSubgraphSchema({ typeDefs, resolvers });
  console.log('✅ Subgraph schema built successfully.');
} catch (schemaError) {
  console.error('❌ Fatal error building subgraph schema:', schemaError);

  console.error(JSON.stringify(schemaError, null, 2));
  process.exit(1); // 
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
    context: async ({ req, res }) => ({
      req,
      res,
      container,
      user: req.user ?? null,
    }
    ),
  })
);
app.use(express.json());
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