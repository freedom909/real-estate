// middleware/authenticate.js
import jwt from "jsonwebtoken";
import { touchSession } from "../session/sessionHeartbeat.js";

export function authenticate({ redis }) {
  return async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).end();

    const token = auth.replace("Bearer ", "");

    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );

      req.user = payload;

      // ✅ Heartbeat
      if (payload.sessionId) {
        await touchSession(
          redis,
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
