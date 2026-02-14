import geoip, { Location } from "geoip-lite";
import redis from "../../../../infrastructure/redis/redis.js";
import { debugRisk } from "../../../../shared/debug.js";

interface RiskEvent {
  type: string;
  userId: string;
  ip: string;
  userAgent?: string;
  metadata?: any;
  severity: string;
  createdAt?: Date;
}

interface EvaluateParams {
  userId: string;
  ip: string;
  deviceId: string;
}

interface EvaluateResult {
  risk: number;
  flags: string[];
  country: string;
}

interface LoginProfile {
  lastIp?: string;
  lastCountry?: string;
  lastLoginAt?: number;
}

interface SuccessRecordParams {
  userId: string;
  ip: string;
  deviceId: string;
  country: string;
}

interface ReuseParams {
  userId: string;
  ip: string;
  userAgent?: string;
  refreshTokenId: string;
}

interface RiskEventRepo {
  save(event: RiskEvent): Promise<void>;
}

export default class LoginRiskService {
  private riskEventRepo: RiskEventRepo;

  constructor({ riskEventRepo }: { riskEventRepo: RiskEventRepo }) {
    this.riskEventRepo = riskEventRepo;
  }

  isRisky({ oldIp, newIp, oldUA, newUA }: { oldIp?: string; newIp: string; oldUA?: string; newUA?: string }): boolean {
    if (oldIp && oldIp !== newIp) return true;
    if (oldUA && oldUA !== newUA) return true;
    return false;
  }

  async record(event: Omit<RiskEvent, 'createdAt'>): Promise<void> {
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
  }: ReuseParams): Promise<void> {
    debugRisk("Handle refresh token reuse", {
      userId,
      ip,
      userAgent,
      refreshTokenId,
    });
    await this.record({
      type: "REFRESH_TOKEN_REUSE",
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
  }: EvaluateParams): Promise<EvaluateResult> {
    let risk = 0;
    const flags: string[] = [];

    const geo: Location | null = geoip.lookup(ip);
    const country = geo?.country ?? "UNKNOWN";

    const profileKey = `user:${userId}:loginProfile`;

    const profile: LoginProfile = await redis.hgetall(profileKey);

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

    return { risk, flags, country };
  }

  async recordSuccess({
    userId,
    ip,
    deviceId,
    country,
  }: SuccessRecordParams): Promise<void> {
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

    await pipeline.exec();
  }

  async onRefreshTokenReuse(userId: string): Promise<void> {
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

  async freezeUser(userId: string): Promise<void> {
    await redis.set(
      `user:${userId}:security`,
      JSON.stringify({
        status: "FROZEN",
        reason: "REFRESH_TOKEN_REUSE",
        at: Date.now(),
      })
    );
  }

  async assertUserIsActive(userId: string): Promise<void> {
    const data = await redis.get(`user:${userId}:security`);
    if (!data) return;

    const security = JSON.parse(data);
    if (security.status === "FROZEN") {
      throw new Error("Account frozen due to security risk");
    }
  }
}