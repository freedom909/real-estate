// src/subgraphs/auth/auth.server.js

import "dotenv/config";
import fs from "fs";
import path from "path";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parse } from "graphql";

import resolvers from "./resolvers/index.js";
import { authDirectiveTransformer } from "../shared/auth/authDirectiveTransformer.js";
import { buildAuthContext } from "../shared/auth/auth.context.js";

const PORT = Number(process.env.PORT || 4001);

/**
 * 1️⃣ Load schema
 */
const schemaPath = path.join(
  process.cwd(),
  "src/subgraphs/auth/schema.graphql"
);

const typeDefs = parse(fs.readFileSync(schemaPath, "utf-8"));

/**
 * 2️⃣ Build subgraph schema
 */
let schema = buildSubgraphSchema([
  {
    typeDefs,
    resolvers,
  },
]);

/**
 * 3️⃣ Apply auth directive transformer
 */
schema = authDirectiveTransformer(schema);

/**
 * 4️⃣ Create Apollo Server
 */
const server = new ApolloServer({
  schema,
});

/**
 * 5️⃣ Start server
 */
const { url } = await startStandaloneServer(server, {
  listen: {
    port: PORT,
    host: "0.0.0.0",
  },
  context: buildAuthContext,
});

console.log(`🔐 Auth subgraph ready at ${url}`);
