// src/subgraphs/auth/repos/riskEvent.repo.ts
import { debugRisk } from "../../../shared/debug.js";

interface RedisClient {
  set(key: string, value: string, ex: string, seconds: number): Promise<void>;
}

interface RiskEvent {
  userId: string;
  [key: string]: any;
}

export default class RiskEventRepo {
  private redis?: RedisClient;

  constructor({ redis }: { redis?: RedisClient } = {}) {
    this.redis = redis;
  }

  async save(event: RiskEvent): Promise<void> {
    debugRisk("Risk event saved", event);
    if (!this.redis) return;
    const key = `risk:${event.userId}:${Date.now()}`;
    await this.redis.set(
      key,
      JSON.stringify(event),
      "EX",
      60 * 60 * 24 * 30 // 30 天
    );
  }
}