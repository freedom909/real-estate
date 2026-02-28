//src/gateway/helpers/classifyToken.ts

import jwt, { JwtPayload } from "jsonwebtoken";

const EXTERNAL_PROVIDER_DOMAINS = ['google', 'apple', 'facebook', 'github'];

export function classifyToken(token: string): "internal" | "external" | "invalid" {
  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded || typeof decoded !== 'object' || !decoded.iss) {
    return "invalid";
  }

  // 1. Check for internal token issued by our own auth service.
  if (decoded.iss === process.env.JWT_ISSUER) {
    return "internal";
  }

  // 2. Check for external tokens from third-party OAuth providers.
  // This checks if the issuer string contains any of the known provider domains.
  const isExternal = EXTERNAL_PROVIDER_DOMAINS.some(domain => decoded.iss!.includes(domain));
  if (isExternal) {
    return "external";
  }

  // 3. If the issuer is not recognized as internal or a known external, classify as invalid.
  return "invalid";
}
