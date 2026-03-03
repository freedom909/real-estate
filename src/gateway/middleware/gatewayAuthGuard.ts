// src/gateway/middleware/gatewayAuthGuard.ts

import { Request, Response, NextFunction } from "express"
import { JwtVerifier } from "../../security/service/jwt/JwtVerifier"

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const createGatewayAuthGuard =
  (verifier: JwtVerifier) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "")

      if (!token) {
        return next()
      }

      const payload = verifier.verify(token)

      req.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      }

      next()
    } catch (err) {
      console.log("JWT verify failed")
      next()
    }
  }