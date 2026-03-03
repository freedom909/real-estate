// src/services/tokenBinding.service.ts

import { hash } from "@/utils/hash";
import { Session } from "../models/session.model";
import LoginRiskService from "../services/risk/loginRisk.service";

import { injectable } from "tsyringe";

@injectable()
export default class TokenBindingService {
  constructor(private loginRiskService: LoginRiskService) {}

  async validate(params: {
    session: Session;
    ip: string;
    userAgent: string;
    deviceId?: string;
  }) {
    if (params.deviceId !== params.session.deviceId) {
      throw new Error("Device mismatch");
    }

    if (hash(params.userAgent) !== params.session.userAgentHash) {
      throw new Error("UA mismatch");
    }

    if (hash(params.ip) !== params.session.ipHash) {
      // 不直接拒绝,记录风险事件
      await this.loginRiskService.record({
        type: "IP_CHANGE",
        userId: params.session.userId,
        ip: params.ip,
        userAgent: params.userAgent,
        severity: "LOW",
        metadata: {
          sessionId: params.session.id,
          expectedIpHash: params.session.ipHash,
        },
      });
    }
  }
}