import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloGateway, RemoteGraphQLDataSource } from "@apollo/gateway";
const app = express();
const httpServer = http.createServer(app);
async function startGateway() {
    console.log("🚀 Gateway starting");
    const supergraphSdl = readFileSync("./supergraph.graphql", "utf-8");
    const gateway = new ApolloGateway({
        supergraphSdl,
        buildService({ url }) {
            return new RemoteGraphQLDataSource({
                url,
                willSendRequest({ request, context }) {
                    if (context.authorization) {
                        request.http?.headers.set("authorization", context.authorization);
                    }
                },
            });
        },
    });
    const server = new ApolloServer({
        gateway,
        introspection: true,
    });
    await server.start();
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json());
    app.use("/graphql", expressMiddleware(server, {
        context: async ({ req }) => {
            console.log("Gateway received:", req.headers.authorization);
            return {
                authorization: req.headers.authorization || "",
            };
        },
    }));
    httpServer.listen(4000, () => {
        console.log("🚀 Gateway running");
    });
}
startGateway();
