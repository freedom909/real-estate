// shared/security/jwt/JwtSigner.ts

// src/security/service/jwt/JwtSigner.ts
import jwt, { SignOptions } from "jsonwebtoken"

const options: SignOptions = {
  algorithm: "RS256",
  expiresIn: "15m",
}

export class JwtSigner {
  constructor(private privateKey: string) {}

  sign(payload: object, expiresIn: string) {
    return jwt.sign(payload, this.privateKey, options)
  }
}