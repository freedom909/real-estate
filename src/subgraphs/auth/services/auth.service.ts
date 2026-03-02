// src/subgraphs/auth/services/auth.service.ts
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import{ hash }from "@/utils/hash";
import { ForbiddenError } from "@/infrastructure/utils/errors";
import AccessTokenBlacklist from "@/shared/security/blacklist";

interface OAuthUser {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  [key: string]: any;
}

interface LoginContext {
  ip?: string;
  deviceId?: string;
  userAgent?: string;
  familyId?: string;
}

interface OAuthProfile {
  provider: string;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

interface OAuthLoginContext {
  userId: string;
  ip?: string;
  deviceId?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
}

interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
}

interface User {
  id: string;
  [key: string]: any;
}

interface AuthTokens {
  accessToken: string;
}

interface AuthCredential {
  id: string;
  userId: string;
  provider: string;
  providerSub: string;
  email?: string;
  source: string;
  familyId?: string;
}

interface SessionData {
  userId: string;
  familyId: string;
  deviceId: string;
  userAgent: string;
  ip: string;
  refreshTokenId: string;
  lastSeenAt: Date;
}

interface AuthServiceDependencies {
  oauthService: any;
  userClient: any;
  credentialRepo: any;
  tokenService: any;
  loginRiskService: any;
  refreshTokenRepo: any;
  oauthAccountRepo: any;
  sessionRepo: any;
  accessTokenBlacklist: AccessTokenBlacklist;
}

export default class AuthService {
  private oauthService: any;
  private userClient: any;
  private credentialRepo: any;
  private tokenService: any;
  private loginRiskService: any;
  private refreshTokenRepo: any;
  private oauthAccountRepo: any;
  private sessionRepo: any;
  private refreshPublicKey: string;
  private accessTokenBlacklist: AccessTokenBlacklist;


  constructor(deps: AuthServiceDependencies) {
    const required: (keyof AuthServiceDependencies)[] = [
      "oauthService",
      "userClient",
      "credentialRepo",
      "tokenService",
      "loginRiskService",
      "refreshTokenRepo",
      "oauthAccountRepo",
      "sessionRepo",
      "accessTokenBlacklist"
    ];

    for (const key of required) {
      if (!deps[key]) {
        throw new Error(`AuthService missing dependency: ${String(key)}`);
      }
    }

    Object.assign(this, deps);
  }


  /**
   * =====================================================
   * 🔐 OAuth Login (Profile-based, legacy / frontend)
   * =====================================================
   */
  async oauthLogin(profile: OAuthProfile, ctx: LoginContext = {}): Promise<any> {
    const familyId = randomUUID();
    const {
      provider,
      providerUserId,
      email,
      name,
      avatar,
    } = profile;

    let oauthAccount: any = await this.oauthAccountRepo.findByProviderUserId(
      provider,
      providerUserId
    );

    let userId: string;
    let isNewUser = false;

    if (oauthAccount) {
      if (!oauthAccount.userId) {
        throw new Error("OAUTH_ACCOUNT_MISSING_USER_ID");
      }

      userId = oauthAccount.userId;
    } else {
      let user: User | null = null;

      if (email) {
        user = await this.userClient.findByEmail(email);
      }

      if (user) {
        userId = user.id;

        await this.oauthAccountRepo.create({
          userId,
          provider,
          providerUserId,
          email,
          familyId,
        });
      } else {
        const created: User = await this.userClient.createOAuthUser({
          email,
          profile: { name, avatar, email },
        });

        userId = created.id;
        isNewUser = true;
      }
    }

    return this._login(
      userId,

      { ...ctx, familyId },
      isNewUser
    );
  }

  /**
   * =====================================================
   * 🔑 Core Login Logic (Single Source of Truth)
   * =====================================================
   */
  async _login(userId: string, ctx: LoginContext, isNewUser = false): Promise<any> {
    const {
      ip,
      deviceId,
      userAgent,
      familyId,
    } = ctx;

    if (!familyId) {
      throw new Error("FAMILY_ID_REQUIRED");
    }

    // 1️⃣ Risk log
    await this.loginRiskService.record({
      type: "LOGIN",
      userId,
      ip,
      deviceId,
      userAgent,
      familyId,
      severity: "LOW",
    });
    const session = await this.sessionRepo.create({
      userId,
      familyId,
      deviceId,
      userAgentHash: hash(userAgent),
      ipHash: hash(ip),
      lastSeenAt: new Date(),
    })
    const sessionId = session._id.toString()
    // 2️⃣ Issue tokens
    const tokens: TokensResponse = await this.tokenService.issueTokenPair({
      userId,
      familyId,
      ip,
      deviceId,
      userAgent,
      sessionId,
    });

    // 3️⃣ Persist refresh token
    await this.refreshTokenRepo.save(

      tokens.refreshToken,
      {
        userId,
        familyId,
        ip,
        deviceId,
        userAgent,
        issuedAt: new Date(),
        sessionId,
        jti: tokens.refreshJti,
        expiresAt: new Date(
          Date.now() + this.tokenService.parseExpires(this.tokenService.config.refreshExpiresIn)
        ),
      }
    );

    // auth.service.js (_login)
    await this.sessionRepo.updateById(sessionId, {
      refreshTokenId: tokens.refreshJti,
    });


    return {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      familyId,
      isNewUser,
      sessionId,
    };
  }

  /**
   * =====================================================
   * 🔗 Bind OAuth Provider
   * =====================================================
   */
  async bindOAuthAccount(provider: string, idToken: string, ctx: OAuthLoginContext): Promise<boolean> {
    console.log("App token:", idToken);
    const { userId, ip, deviceId } = ctx;

    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    const oauth: OAuthUser = await this.oauthService.verifyIdToken(provider, idToken);


    const {
      sub: providerUserId,
      email,
      emailVerified,
    } = oauth;

    if (!providerUserId) {
      throw new Error("INVALID_OAUTH_TOKEN");
    }

    if (email && !emailVerified) {
      throw new Error("OAUTH_EMAIL_NOT_VERIFIED");
    }

    const existing: AuthCredential | null =
      await this.credentialRepo.findByProviderSub({
        provider,
        providerSub: providerUserId,
      });

    if (existing && existing.userId !== userId) {
      throw new Error("OAUTH_ALREADY_BOUND");
    }

    if (!existing) {
      await this.credentialRepo.create({
        userId,
        provider,
        providerSub: providerUserId,
        email,
        source: "USER_BIND",
      });
    }

    await this.loginRiskService.record({
      type: "BIND_OAUTH",
      userId,
      provider,
      ip,
      deviceId,
      severity: "LOW",
    });

    return true;
  }

  /**
   * =====================================================
   * ❌ Unbind OAuth Provider
   * =====================================================
   */
  async unbindOAuthAccount(provider: string, ctx: OAuthLoginContext): Promise<boolean> {
    const { userId, ip, deviceId } = ctx;

    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    const credentials: AuthCredential[] = await this.credentialRepo.findByUserId(userId);

    if (credentials.length <= 1) {
      throw new Error("CANNOT_UNBIND_LAST_PROVIDER");
    }

    const target: AuthCredential | undefined = credentials.find((c) => c.provider === provider);

    if (!target) {
      throw new Error("OAUTH_NOT_BOUND");
    }

    await this.credentialRepo.deleteById(target.id);

    await this.loginRiskService.record({
      type: "UNBIND_OAUTH",
      userId,
      provider,
      ip,
      deviceId,
      severity: "LOW",
    });

    return true;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new Error("NO_REFRESH_TOKEN");
    }

    // 1️⃣ 验证签名
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { sub: userId, familyId, jti, sessionId } = payload;

    if (!userId || !familyId || !jti || !sessionId) {
      throw new Error("INVALID_REFRESH_PAYLOAD");
    }

    // 2️⃣ 原子 consume
    const consumed = await this.refreshTokenRepo.consume(refreshToken);

    // 🔥 Reuse Detection
    if (!consumed) {
      await this.refreshTokenRepo.revokeFamily(familyId);

      await this.loginRiskService.record({
        type: "REFRESH_REUSE_DETECTED",
        userId,
        familyId,
        severity: "HIGH",
      });

      throw new ForbiddenError("REFRESH_REUSE_DETECTED");
    }

    // 3️⃣ 生成新 token
    const tokens = await this.tokenService.issueTokenPair({
      userId,
      familyId,
      sessionId,
    });

    // 4️⃣ 保存新 refresh token
    await this.refreshTokenRepo.save(tokens.refreshToken, {
      userId,
      familyId,
      sessionId,
      jti: tokens.refreshJti,
      issuedAt: new Date(),
      expiresAt: new Date(
        Date.now() +
        this.tokenService.parseExpires(
          this.tokenService.config.refreshExpiresIn
        )
      ),
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  async getMySessions(userId: string) {
    return this.sessionRepo.findActiveByUser(userId);
  }

  async revokeSession(userId: string, sessionId: string, accessToken: string) {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("CANNOT_REVOKE_OTHER_SESSION");
    }

    // 1️⃣ revoke refresh tokens
    await this.refreshTokenRepo.revokeBySession(sessionId);

    // 2️⃣ revoke session
    await this.sessionRepo.revokeById(sessionId);
    // 3️⃣ blacklist current access token

    if (accessToken) {
      const decoded = await this.tokenService.verifyAccessToken(accessToken);

      await this.accessTokenBlacklist.blacklist(decoded.jti, decoded.exp);
    }
    return true;
  }
}