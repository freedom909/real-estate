// middleware/authenticate.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { touchSession } from "../session/sessionHeartbeat.js";

interface UserPayload {
  sub: string;
  sessionId?: string;
  deviceId?: string;
  familyId?: string;
  [key: string]: any;
}

interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<void>;
  del(key: string): Promise<number>;
}

interface AuthenticateOptions {
  redis: RedisClient;
}

export function authenticate({ redis }: AuthenticateOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).end();

    const token = auth.replace("Bearer ", "");

    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as UserPayload;

      (req as any).user = payload;
      // ✅ Heartbeat
      if (payload.sessionId) {
        await touchSession(
          redis as any,
          payload.sessionId,
          {
            userId: payload.sub,
            deviceId: payload.deviceId,
            familyId: payload.familyId,
          },
          15 * 60 // seconds
        );
      }

      next();
    } catch {
      res.status(401).end();
    }
  };
}