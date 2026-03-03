// security/service/jwt/JwtVerifier.ts

import jwt from "jsonwebtoken"

export interface JwtPayload {
  sub: string
  email?: string
  role?: string
}

export class JwtVerifier {
  constructor(private publicKey: string) {}

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.publicKey, {
      algorithms: ["RS256"],
    }) as JwtPayload
  }
}