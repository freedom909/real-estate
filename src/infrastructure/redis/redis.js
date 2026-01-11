// src/infrastructure/redis/redis.js
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis = null;

export function createRedis() {
  if (redis) return redis;

  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
  }

  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error", err);
  });

  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export default redis;