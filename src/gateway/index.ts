import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloGateway } from "@apollo/gateway";
import AuthenticatedDataSource from "@/infrastructure/auth/authenticatedDataSource";

const app = express();
const httpServer = http.createServer(app);

interface MyContext {
  req: express.Request;
  res: express.Response;
  user?: JwtPayload;
  authorization?: string;
}

async function startGateway() {
  console.log("🚀 Gateway starting");

  // ==============================
  // 1️⃣ Build Gateway
  // ==============================
  const supergraphSdl = fs.readFileSync("./supergraph.graphql", "utf-8");

  const gateway = new ApolloGateway({
    supergraphSdl,
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    },
  });

  // ==============================
  // 2️⃣ Create Apollo Server
  // ==============================
  const server = new ApolloServer<MyContext>({
    gateway,
    introspection: true,

    plugins: [
      {
        async requestDidStart() {
          return {
            async willSendResponse({ contextValue, response }) {
              const { res } = contextValue;

              if (!res) return;

              if (response.body.kind === "single") {
                const data = response.body.singleResult.data as any;

                // ✅ Set refresh token cookie
                if (data?.oauthLogin?.refreshToken) {
                  res.cookie("refresh_token", data.oauthLogin.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                  });

                  // Optional: remove refreshToken from GraphQL response
                  delete data.oauthLogin.refreshToken;
                }
              }
            },
          };
        },
      },
    ],
  });

  // 🚨 MUST START BEFORE expressMiddleware
  await server.start();

  // ==============================
  // 3️⃣ Load Public Key (Dev Safe)
  // ==============================
  let PUBLIC_KEY: string | null = null;

  try {
    const keyPath =
      process.env.JWT_PUBLIC_KEY_PATH || "./src/keys/public.pem";

    PUBLIC_KEY = fs.readFileSync(path.resolve(keyPath), "utf8");

    console.log("✅ Public key loaded");
  } catch {
    console.warn(
      "⚠️ Public key not found. JWT verification skipped (DEV MODE)."
    );
  }

  // ==============================
  // 4️⃣ Express Middlewares
  // ==============================
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware<MyContext>(server, {
      context: async ({ req, res }): Promise<MyContext> => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          return { req, res };
        }

        const token = authHeader.replace("Bearer ", "");

        // ==============================
        // DEV MODE: Skip verification
        // ==============================
        if (!PUBLIC_KEY) {
          console.warn("⚠️ DEV MODE: Skipping JWT verification");
          return {
            req,
            res,
            user: { sub: "dev-user" } as JwtPayload,
            authorization: `Bearer ${token}`,
          };
        }

        // ==============================
        // PROD MODE: Verify JWT
        // ==============================
        try {
          const verified = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ["RS256"],
            issuer: "auth-service",
          }) as JwtPayload;

          return {
            req,
            res,
            user: verified,
            authorization: `Bearer ${token}`,
          };
        } catch (err: any) {
          console.error("❌ Token verification failed:", err.message);
          return { req, res };
        }
      },
    })
  );

  // ==============================
  // 5️⃣ Start Server
  // ==============================
  httpServer.listen(4000, () => {
    console.log("🚀 Gateway running at http://localhost:4000/graphql");
  });
}

startGateway();
