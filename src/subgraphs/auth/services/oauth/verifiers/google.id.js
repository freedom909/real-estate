// src/subgraphs/auth/services/oauth/verifiers/google.id.js
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
console.log(typeof client.verifyIdToken); 
// should print: "function"

export default async function verifyGoogleIdToken(
  idToken
) {
  if (!idToken) {
    throw new Error("GOOGLE_ID_TOKEN_REQUIRED");
  }

// should print: "function"

  const ticket = await client.verifyIdToken({// verifyIdToken() is undefined
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("INVALID_GOOGLE_TOKEN");
  }

  return {
    provider: "GOOGLE",
    sub: payload.sub,                  // ✅ 唯一标识
    email: payload.email || null,
    emailVerified: payload.email_verified || false,
    name: payload.name || null,
    picture: payload.picture || null,
  };
}

