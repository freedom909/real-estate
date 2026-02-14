// sessionHeartbeat.ts
import { Redis } from "ioredis";

export function touchSession(
  redis: Redis,
  sessionId: string,
  sessionData: SessionData,
  ttl: number
) {
  return redis.setex(
    sessionId,
    ttl,
    JSON.stringify(sessionData)
  );
}

export interface SessionData {
  userId: string;
  deviceId?: string;
  familyId?: string;
}
