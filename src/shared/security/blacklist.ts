// shared/security/blacklist.ts

import { injectable, inject } from "tsyringe";
import { Redis } from "ioredis";
import { TOKENS } from "@/shared/container/tokens";

@injectable()
export default class AccessTokenBlacklist {
  constructor(
    @inject(TOKENS.infra.redis)
    private readonly redis: Redis
  ) {}

  async blacklist(jti: string, exp: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;

    if (ttl <= 0) return;

    await this.redis.set(`bl:${jti}`, "1", "EX", ttl);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const exists = await this.redis.get(`bl:${jti}`);
    return !!exists;
  }
}