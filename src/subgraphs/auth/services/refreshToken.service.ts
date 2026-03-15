// src/subgraphs/auth/services/refresh/refreshToken.service.ts

import { hash } from "@/utils/hash";
import{ TokenService} from "./token.service";
import { RefreshTokenMeta } from "../models/refreshToken.model.js";
import { injectable } from "tsyringe";
import SessionRepository from "../repos/session.repo";
import UserClient from "../adapters/user.client";

interface RefreshTokenRepo {
  revokeFamily(familyId: string): Promise<void>;
  findByJti(jti: string): Promise<any>;
  markAsUsed(jti: string, usedAt: Date): Promise<void>;
  consume(token: string): Promise<any>;
  save(token: string, meta: RefreshTokenMeta & { jti: string; expiresAt: Date }): Promise<void>;
  revokeBySession(sessionId: string): Promise<void>;
  revokeAllByUser(userId: string): Promise<void>;
}

export interface User {
  id: string
  email: string
  tokenVersion: number
}

interface UserRepo {
  getTokenVersion(userId: string): Promise<number>;
}

interface LoginRiskService {
  handleRefreshTokenReuse(data: any): Promise<void>;
}

interface RefreshContext {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

@injectable()
export default class RefreshTokenService {
  
  constructor(
  private tokenService: TokenService,
  private refreshTokenRepository: RefreshTokenRepo,
  
  private riskService: LoginRiskService,
  private sessionRepo: SessionRepository,
  private userClient: UserClient
  ) {}

  async rotate(refreshToken: string, ctx: RefreshContext) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const {
      sub: userId,
      familyId,
      sessionId,
      jti,
   
    } = payload;
  

    // 1 原子消费
    const consumed = await this.refreshTokenRepository.consume(jti);

    if (!consumed) {
      // 🚨 reuse detected
      await this.refreshTokenRepository.revokeBySession(sessionId);

      await this.riskService.handleRefreshTokenReuse({
        userId,
        familyId,
        sessionId,
        ...ctx,
      });

      throw new Error("Refresh token reuse detected");
    }

    // 2 发行新 token
    const pair = await this.tokenService.issueTokenPair({
      userId,
      familyId,
      sessionId,
      deviceId: ctx.deviceId ,
      ip: ctx.ip ? hash(ctx.ip) : undefined,
      userAgent: ctx.userAgent ? hash(ctx.userAgent) : undefined,
    });
    // 3️⃣ 保存 refresh token
    await this.refreshTokenRepository.save(pair.refreshToken, {
      userId,
      familyId,
      sessionId,
      issuedAt: new Date(),
      expiresAt: pair.refreshExpiresAt,
      jti: pair.refreshJti,
    });

    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
    };
  }

  async refresh(refreshToken: string,userClient: UserClient) {

    const payload = await this.tokenService.verifyRefreshToken(refreshToken)
    
    const token = await this.refreshTokenRepository.findByJti(payload.jti)

    if (!token) {
      throw new Error("Refresh token not found")
    }

    if (token.status === "used") {

      // reuse attack
      await this.refreshTokenRepository.revokeFamily(payload.familyId)

      throw new Error("Refresh token reuse detected")
    }

    if (token.status === "revoked") {
      throw new Error("Token revoked")
    }

    await this.refreshTokenRepository.markAsUsed(payload.jti,new Date())

    const tokens = await this.tokenService.issueTokenPair({
      userId: payload.sub,
      sessionId: payload.sessionId,
      familyId: payload.familyId,
      deviceId: payload.deviceId ?? undefined,
    })

    await this.refreshTokenRepository.save(
      tokens.refreshToken,//
      {       
        userId: payload.sub,
        sessionId: payload.sessionId,
        ...payload,
        jti: tokens.refreshJti,
        expiresAt: tokens.refreshExpiresAt,
        issuedAt: new Date(),
        familyId: payload.familyId
      },
   
    )

    // await this.sessionRepo.updateLastSeen(payload.sessionId)

    return {
      ...tokens,
    }
  }


  async revokeAll(userId: string) {
    await this.refreshTokenRepository.revokeAllByUser(userId);
  }
}