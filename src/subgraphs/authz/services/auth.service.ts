// src/subgraphs/auth/services/auth.service.ts

import { inject, injectable } from "tsyringe";
import mongoose from "mongoose";

import { TokenService, TokenPayload } from "./token.service";
import {OAuthService} from "./oauth.service";
import LoginRiskService from "../risk/login.engine";
import RefreshTokenRepo from "../repos/refresh-token.repo";
import CredentialRepo from "../repos/credential.repo";
import OAuthAccountRepo from "../repos/oauthAccount.repo";
import SessionRepo from "../repos/session.repo";
import UserClient from "../adapters/user.client";
import Blacklist from "../../../security/blacklist/blacklist";


import { ForbiddenError } from "@/infrastructure/utils/errors";
import { hash } from "@/utils/hash";
import { TOKENS } from "@/shared/container/tokens";

interface LoginContext {
  ip: string;
  deviceId: string;
  userAgent?: string;
}

interface OAuthPayload {
  name?: string;
  picture?: string;
  sub: string;
  email?: string;
  emailVerified?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// 依赖接口定义
interface AuthServiceDeps {
  oauthService: OAuthService;
  tokenService: TokenService;
  refreshTokenRepo: RefreshTokenRepo;
  credentialRepo: CredentialRepo;
  oauthAccountRepo: OAuthAccountRepo;
  sessionRepo: SessionRepo;
  loginRiskService: LoginRiskService;
  userClient: UserClient;
  blacklist: Blacklist;
  refreshTokenService?: any;
}

@injectable()
export default class AuthService {
  private credentialRepo: CredentialRepo;
  private refreshTokenRepo: RefreshTokenRepo;
  private oauthAccountRepo: OAuthAccountRepo;
  private sessionRepo: SessionRepo;
  private loginRiskService: LoginRiskService;
  private oauthService: OAuthService;
  private tokenService: TokenService;
  private blacklist: Blacklist;
  private userClient: UserClient;

  constructor(deps: AuthServiceDeps) {
    this.credentialRepo = deps.credentialRepo;
    this.refreshTokenRepo = deps.refreshTokenRepo;
    this.oauthAccountRepo = deps.oauthAccountRepo;
    this.sessionRepo = deps.sessionRepo;
    this.loginRiskService = deps.loginRiskService;
    this.oauthService = deps.oauthService;
    this.tokenService = deps.tokenService;
    this.blacklist = deps.blacklist;
    this.userClient = deps.userClient;
  }

  /*
  =========================================
  OAuth LOGIN
  =========================================
  */
  async oauthLogin(
    provider: string,
    idToken: string,
    ctx: LoginContext
  ): Promise<AuthTokens> {
    const payload: OAuthPayload = await this.oauthService.verify(
      provider,
      idToken
    );
   console.log("payload", payload)
    if (!payload.sub) {
      throw new Error("INVALID_OAUTH_TOKEN");
    }
    console.log("payload.sub", payload.sub)
    console.log("provider", provider)
    let oauthAccount =
      await this.oauthAccountRepo.findByProviderSub(
        provider,
        payload.sub
      );
    let userId: string;

    if (oauthAccount) {
      userId = oauthAccount.userId;
    } else {
      if (!payload.email) {
        throw new Error("OAUTH_EMAIL_REQUIRED");
      }
     console.log("payload.email+++", payload.email)
      let user = await this.userClient.findByEmail(payload.email);//it did not call the 'userClient.findByEmail' method
console.log("userClient instance:", this.userClient);//no output
      console.log("user++", user)//no output
      if (!user) {
        user = await this.userClient.createOAuthUser({
          email: payload.email,
          profile: {
            name: payload.email,
            avatar: payload.picture,
          },
        });
        
      }

      userId = user.id;

      await this.oauthAccountRepo.create({
        userId,
        provider,
        sub: payload.sub,
      });
    }
    
    const session = await this.sessionRepo.create({
      userId,
      deviceId: ctx.deviceId,
      familyId: new mongoose.Types.ObjectId().toHexString(),
      refreshTokenId: new mongoose.Types.ObjectId().toHexString(),
      ipHash: hash(ctx.ip),
      userAgentHash: hash(ctx.userAgent)
    });

    const { token: accessToken } = 
      this.tokenService.signAccessToken({
        sub: userId,
        sessionId: session.id,
      });

    const {
      token: refreshToken,
      familyId: sessionFamilyId,
      jti: refreshJti,
    } = this.tokenService.signRefreshToken({
      sub: userId,
      familyId: session.familyId,
      sessionId: session.id,
    });

    // 修复：对 Token 进行哈希，并传递单一对象给 save
    await this.refreshTokenRepo.save(refreshToken,{
      
      userId,
      sessionId: session.id,
      jti: refreshJti,
      familyId: sessionFamilyId,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    await this.loginRiskService.record({
      type: "LOGIN_OAUTH",
      userId,
      provider,
      ip: ctx.ip,
      deviceId: ctx.deviceId,
      severity: "LOW",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /*
  =========================================
  REFRESH TOKEN ROTATION
  =========================================
  */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload =
      await this.tokenService.verifyRefreshToken(
        refreshToken
      );

    // TokenPayload 包含这些字段，移除 as any
    const { sub: userId, jti, familyId, sessionId } = payload;

    // 修复：消费哈希值
    const consumed =
      await this.refreshTokenRepo.consume(hash(refreshToken));

    if (!consumed) {
      // @ts-ignore: 假设 repo 有此方法
      if (this.refreshTokenRepo.revokeFamily) {
         // @ts-ignore
         await this.refreshTokenRepo.revokeFamily(familyId);
      }

      await this.loginRiskService.record({
        type: "REFRESH_REUSE_DETECTED",
        userId,
        severity: "HIGH",
        ip: payload.ip,
        deviceId: payload.deviceId,
        familyId,
        sessionId,
      });

      throw new ForbiddenError("REFRESH_REUSE_DETECTED");
    }

    const { token: accessToken } = 
      this.tokenService.signAccessToken({
        sub: userId,
        sessionId,
      });

    const {
      token: newRefreshToken,
      jti: newJti,
    } = this.tokenService.signRefreshToken({
      sub: userId,
      familyId,
      sessionId,
    });

    // 修复：保存新 Token 的哈希
    await this.refreshTokenRepo.save(newRefreshToken,{
      
      userId,
      sessionId,
      jti: newJti,
      familyId,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /*
  =========================================
  LOGOUT
  =========================================
  */
  async logout(accessToken: string) {
    const decoded =
      await this.tokenService.verifyAccessToken(
        accessToken
      );

    await this.blacklist.blacklist(
      decoded.jti,
      decoded.exp
    );

    await this.refreshTokenRepo.revokeBySession(
      decoded.sessionId
    );

    await this.sessionRepo.revokeById(decoded.sessionId);

    return true;
  }

  /*
  =========================================
  BIND OAUTH ACCOUNT
  =========================================
  */
  async bindOAuthAccount(
    userId: string,
    provider: string,
    idToken: string,
    ctx: LoginContext
  ) {
    const payload =
      await this.oauthService.verify(provider, idToken);

    const existing =
      await this.oauthAccountRepo.findByProviderSub(
        provider,
        payload.sub
      );

    if (existing && existing.userId !== userId) {
      throw new Error("OAUTH_ALREADY_BOUND");
    }

    if (!existing) {
      await this.oauthAccountRepo.create({
        userId,
        provider,
        sub: payload.sub,
        
      });
    }

    await this.loginRiskService.record({
      type: "BIND_OAUTH",
      userId,
      provider,
      ip: ctx.ip,
      deviceId: ctx.deviceId,
      severity: "LOW",
    });

    return true;
  }

  /*
  =========================================
  UNBIND OAUTH
  =========================================
  */
  async unbindOAuthAccount(
    userId: string,
    provider: string,
    ctx: LoginContext
  ) {
    const accounts =
      await this.oauthAccountRepo.findById(userId);

    if (accounts.length <= 1) {
      throw new Error("CANNOT_REMOVE_LAST_PROVIDER");
    }

    const target = accounts.find(
      (a: any) => a.provider === provider
    );

    if (!target) {
      throw new Error("PROVIDER_NOT_FOUND");
    }

    await this.oauthAccountRepo.deleteById(target.id);

    await this.loginRiskService.record({
      type: "UNBIND_OAUTH",
      userId,
      provider,
      ip: ctx.ip,
      deviceId: ctx.deviceId,
      severity: "LOW",
    });

    return true;
  }

  /*
  =========================================
  SESSIONS
  =========================================
  */
  async getMySessions(userId: string) {
    return this.sessionRepo.findActiveByUser(userId);
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    accessToken: string
  ) {
    const session =
      await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError(
        "CANNOT_REVOKE_OTHER_SESSION"
      );
    }

    await this.refreshTokenRepo.revokeBySession(
      sessionId
    );

    await this.sessionRepo.revokeById(sessionId);

    const decoded =
      await this.tokenService.verifyAccessToken(
        accessToken
      );

    await this.blacklist.blacklist(
      decoded.jti,
      decoded.exp
    );

    return true;
  }
}
