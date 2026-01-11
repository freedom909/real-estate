// src/subgraphs/auth/repos/riskEvent.repo.js
import { debugRisk } from "../../../shared/debug.js";

export default class RiskEventRepo {
  constructor({ redis } = {}) {
    this.redis = redis;
  }

  async save(event) {
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
