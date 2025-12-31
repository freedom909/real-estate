import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs,{ readFileSync } from 'fs';

import path from "path";
import { parse } from "graphql";
import userApi from "./adapters/userApi.js";
import UserAdapter from "./adapters/user.adapter.js";
import resolvers from "./resolvers/resolver.js";
import { createAuthContainer } from "./container/auth.container.js";
import RefreshTokenRepo from "./repos/refresh-token.repo.js";
import dbConfig from "./DB/dbconfig.js";
// schema

const db = await dbConfig. mongo();

const typeDefs = parse(
  readFileSync(
    path.join(process.cwd(), "src/subgraphs/auth/schema.graphql"),
    "utf8"
  )
);

// 🚨 依赖从外部来（封板）
const container = createAuthContainer({
  userService: new UserAdapter({ userApi }),
  refreshTokenRepo: new RefreshTokenRepo({ db}),
});

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

await startStandaloneServer(server, {
  listen: { port: 4001 },
  context: async ({ req, res }) => ({
    req,
    res,
    container,
  }),
});

console.log("🔐 Auth subgraph running at http://localhost:4001/graphql");
