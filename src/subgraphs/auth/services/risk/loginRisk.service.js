import geoip from "geoip-lite";
import redis from "../../../../infrastructure/redis/redis.js";
import { debugRisk } from "../../../../shared/debug.js";

export default class LoginRiskService {
  constructor({ riskEventRepo }) {
    this.riskEventRepo = riskEventRepo;
  }

  isRisky({ oldIp, newIp, oldUA, newUA }) {
    if (oldIp && oldIp !== newIp) return true;
    if (oldUA && oldUA !== newUA) return true;
    return false;
  }

  async record(event) {
    await this.riskEventRepo.save({
      ...event,
      createdAt: new Date(),
    });
  }

  async handleRefreshTokenReuse({
    userId,
    ip,
    userAgent,
    refreshTokenId,
  }) {
    debugRisk("Handle refresh token reuse", {
      userId,
      ip,
      userAgent,
      refreshTokenId,
    });
    await this.record({
      type: "refreshToken_REUSE",
      userId,
      ip,
      userAgent,
      metadata: {
        refreshTokenId,
      },
      severity: "HIGH",
    });
  }

  async evaluate({
    userId,
    ip,
    deviceId,
    
  }) {
    let risk = 0;
    const flags = [];
   
    const geo = geoip.lookup(ip);
    const country = geo?.country ?? "UNKNOWN";

    const profileKey = `user:${userId}:loginProfile`;

    const profile = await redis.hgetall(profileKey);
    
    // 1️⃣ IP 变化
    if (profile.lastIp && profile.lastIp !== ip) {
      risk += 20;
      flags.push("NEW_IP");
    }

    // 2️⃣ 国家变化
    if (
      profile.lastCountry &&
      profile.lastCountry !== country
    ) {
      risk += 40;
      flags.push("NEW_COUNTRY");
    }

    // 3️⃣ 新设备
    const isKnownDevice = await redis.sismember(
      `user:${userId}:knownDevices`,
      deviceId
    );

    if (!isKnownDevice) {
      risk += 30;
      flags.push("NEW_DEVICE");
    }

    // 4️⃣ 时间异常（简单版）
    const hour = new Date().getHours();
    if (
      profile.lastLoginAt &&
      (hour < 6 || hour > 23)
    ) {
      risk += 10;
      flags.push("ODD_HOUR");
    }

    return { risk, flags, country};
  }

  async recordSuccess({
    userId,
    ip,
    deviceId,
    country,
  }) {
    const pipeline = redis.pipeline();

    pipeline.hset(`user:${userId}:loginProfile`, {
      lastIp: ip,
      lastCountry: country,
      lastLoginAt: Date.now(),
    });

    pipeline.sadd(
      `user:${userId}:knownDevices`,
      deviceId
    );

    pipeline.exec();
  }

  async onRefreshTokenReuse(userId) {
    const key = `user:${userId}:reuseCount`;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 3600); // 1h
    }

    // 🚨 阈值
    if (count >= 2) {
      await this.freezeUser(userId);
    }
  }

  async freezeUser(userId) {
    await redis.set(
      `user:${userId}:security`,
      JSON.stringify({
        status: "FROZEN",
        reason: "refreshToken_REUSE",
        at: Date.now(),
      })
    );
  }

  async assertUserIsActive(userId) {
    const data = await redis.get(`user:${userId}:security`);
    if (!data) return;

    const security = JSON.parse(data);
    if (security.status === "FROZEN") {
      throw new Error("Account frozen due to security risk");
    }
  }
}
