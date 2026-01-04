import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import fs from "fs";
import path from "path";
import { parse } from "graphql";
import dotenv from "dotenv";

import resolvers from "./resolvers/user.resolver.js";
import { authDirectiveTransformer } from "../../shared/directives/auth.js";

dotenv.config({ path: "./.env" });

const app = express();

/* ✅ THIS IS WHAT YOU WANT */
app.use(express.json());
app.use((req, _, next) => {
  console.log("USER SUBGRAPH HIT:", req.body);
  next();
});

const typeDefs = parse(
  fs.readFileSync(
    path.join(process.cwd(), "src/subgraphs/user/schema.graphql"),
    "utf-8"
  )
);

let schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
schema = authDirectiveTransformer(schema);

const server = new ApolloServer({
  schema,
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const body = req.body ?? {};
      const query = body.query ?? "";

      // federation internal calls
      if (
        body.operationName === "IntrospectionQuery" ||
        query.includes("_service") ||
        query.includes("_entities")
      ) {
        return {};
      }

      const userHeader = req.headers["x-user"];
      const user = userHeader ? JSON.parse(userHeader) : null;

      return { user };
    },
  })
);

const httpServer = http.createServer(app);
httpServer.listen(4020, () => {
  console.log("🧑 User subgraph running at http://localhost:4020/graphql");
});
