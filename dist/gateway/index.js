import "dotenv/config";
console.log("RAW ENV:", process.env.JWT_PUBLIC_KEY_PATH);
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
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
            });
        },
    });
    const server = new ApolloServer({
        gateway,
        plugins: [
            {
                async requestDidStart() {
                    return {
                        async willSendResponse({ contextValue, response }) {
                            const { res } = contextValue;
                            if (response.body.kind === "single") {
                                const data = response.body.singleResult.data;
                                if (data?.oauthLogin?.refreshToken) {
                                    res.cookie("refresh_token", data.oauthLogin.refreshToken, {
                                        httpOnly: true,
                                        secure: false,
                                        sameSite: "lax",
                                    });
                                }
                            }
                        },
                    };
                },
            },
        ],
        introspection: true,
    });
    const PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_PATH, "utf8");
    // const PUBLIC_KEY = readFileSync(PUBLIC_KEY_PATH, "utf8");
    // console.log("PUBLIC_KEY_PATH:", PUBLIC_KEY_PATH);
    console.log("PUBLIC_KEY:", PUBLIC_KEY);
    console.log("GATEWAY using public key:", process.env.JWT_PUBLIC_KEY_PATH);
    await server.start();
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json());
    app.use("/graphql", expressMiddleware(server, {
        context: async ({ req, res }) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return { req, res };
            }
            const token = authHeader.replace("Bearer ", "");
            try {
                const verified = jwt.verify(token, PUBLIC_KEY, {
                    algorithms: ["RS256"],
                    issuer: "auth-service",
                });
                const decoded = jwt.decode(token);
                console.log("DECODED TOKEN:", decoded);
                return {
                    req,
                    res,
                    user: verified,
                    authorization: `Bearer ${token}`, // forward to subgraphs
                };
            }
            catch (err) {
                console.error("Token verification failed:", err.message);
                return { req, res };
            }
        }
    }));
    httpServer.listen(4000, () => {
        console.log("🚀 Gateway running, at http://localhost:4000/graphql");
    });
}
startGateway();
