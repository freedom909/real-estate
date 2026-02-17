// src/shared/container/root.container.js
import createContainer from "./createContainer";
import { TOKENS } from "./tokens";
import Redis from "ioredis";

export const container = createContainer();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

container.register(
  TOKENS.redis,
  () => redis
);
