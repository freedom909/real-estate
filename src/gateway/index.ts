import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as crypto from "crypto";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloGateway } from "@apollo/gateway";
import AuthenticatedDataSource from "@/infrastructure/auth/authenticatedDataSource";
import { classifyToken } from "@/gateway/helpers/classifyToken";
import { JwtVerifier } from "../security/service/jwt/JwtVerifier"
import { createGatewayAuthGuard } from "./middleware/gatewayAuthGuard"

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
  const supergraphSdl = fs.readFileSync("./supergraph.graphql", "utf-8");//现在我删除了supergraph.graphql，如何再生？

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
                  res.cookie("refreshToken", data.oauthLogin.refreshToken, {
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
  console.log("✅ Apollo Server built");
  // 🚨 MUST START BEFORE expressMiddleware
  await server.start();

  // ==============================
  // 3️⃣ Load Public Key (Dev Safe)
  // ==============================
  let PUBLIC_KEY: string | null = null;
     const publicKey = fs.readFileSync("./keys/public.pem", "utf8")
     
    const verifier = new JwtVerifier(publicKey)
  try {

    const keyPath =
      process.env.JWT_PUBLIC_KEY_PATH || "keys/public.pem";

    PUBLIC_KEY = fs.readFileSync(path.resolve(keyPath), "utf8");
    
    console.log("✅ Public key loaded");
  } catch {
    console.warn(
      "⚠️ Public key not found. JWT verification skipped (DEV MODE)."
    );
  }
  app.use(createGatewayAuthGuard(verifier))
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
        const operationName = req.body?.operationName;
        const authHeader = req.headers.authorization;
        if (operationName === "oauthLogin") {
          return { req, res };
        }

        if (!authHeader) {
          throw new Error("Not authenticated");
        }

        const token = authHeader.replace("Bearer ", "");
        const tokenType = classifyToken(token);

        if (tokenType === "external") {
          // 🔥 外部 token 不在 gateway 验证
          return { req, res };
        }

        if (tokenType === "invalid") {
          throw new Error("Invalid token");
        }

        // internal 才验证
        const verified = jwt.verify(token, PUBLIC_KEY!, {
          algorithms: ["RS256"],
        }) as JwtPayload;

        console.log("✅ JWT Verified:", verified);
        const decoded = jwt.decode(token, { json: true });
        if (decoded?.iss === "https://accounts.google.com" || decoded?.iss === "accounts.google.com") {
          return { req, res };
        }

        if (!PUBLIC_KEY) {
          // DEV MODE: If no key, skip verification or fail gracefully
          return { req, res };
        }

        console.log(
          "PUBLIC KEY HASH:",
          crypto.createHash("sha256").update(PUBLIC_KEY!).digest("hex")
        );

        try {
          const verified = jwt.verify(token, PUBLIC_KEY!, {
            algorithms: ["RS256"],
            issuer: process.env.JWT_ISSUER || "auth-service",
          }) as JwtPayload;

          console.log("✅ JWT Verified:", verified);

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