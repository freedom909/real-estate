import { Redis } from "ioredis";
import { CacheClient } from "./type";

export class RedisAdapter implements CacheClient {
  constructor(private redis: Redis) {}

  async set(
    key: string,
    value: string,
    options?: { ttl?: number }
  ): Promise<void> {
    if (options?.ttl) {
      await this.redis.set(key, value, "EX", options.ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
