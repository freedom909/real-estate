//src/gateway/helpers/classifyToken.ts

import jwt, { JwtPayload } from "jsonwebtoken";

export function classifyToken(token: string): "internal" | "external" | "invalid" {
  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded || typeof decoded === "string") {
    return "invalid";
  }

  if (decoded.iss === process.env.JWT_ISSUER) {
    return "internal";
  }

  if (
    decoded.iss === "https://accounts.google.com" ||
    decoded.iss?.includes("google||apple||facebook||github")
  ) {
    return "external";
  }

  return "invalid";
}
