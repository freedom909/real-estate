import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloGateway } from "@apollo/gateway";
const app = express();
const httpServer = http.createServer(app);
async function startGateway() {
    console.log("🚀 Gateway starting");
    const supergraphSdl = readFileSync("./supergraph.graphql", "utf-8");
    const gateway = new ApolloGateway({
        supergraphSdl,
    });
    const server = new ApolloServer({
        gateway,
        introspection: true,
    });
    await server.start();
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json());
    app.use("/graphql", expressMiddleware(server));
    httpServer.listen(4000, () => {
        console.log("🚀 Gateway running");
    });
}
startGateway();
