import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { buildSubgraphSchema } from '@apollo/subgraph'

import {createAuthContainer} from './container/auth.container.js'
import schemaTypeDefs from './schema/schema.typeDefs.js'
import oauthTypeDefs from './schema/oauth.typeDefs.js'
import resolvers from './resolvers/resolver.js'
import mongoose from 'mongoose'

await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/real_estate_auth"
);

// ⭐⭐⭐ 核心：创建 DI 容器实例（一次）
const container = createAuthContainer({
  redis: null,
  userApi: null,
});

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs: [schemaTypeDefs, oauthTypeDefs],
    resolvers,
  }),
});

await server.start();

app.use(
  "/graphql",
  cors({ origin: "http://localhost:3000", credentials: true }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      req,
      container, // ✅ 现在作用域里有了
    }),
  })
);

httpServer.listen(4010, () => {
  console.log("🔐 Auth subgraph running at http://localhost:4010/graphql");
});