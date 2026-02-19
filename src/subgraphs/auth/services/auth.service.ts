// src/subgraphs/auth/services/auth.service.ts
import { randomUUID } from "crypto";

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
          familyId,
          profile: { name, avatar },
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

    // 2️⃣ Issue tokens
    const tokens: TokensResponse = await this.tokenService.issueTokens({
      userId,
      familyId,
      ip,
      deviceId,
      userAgent,
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
      }
    );
    
    // auth.service.js (_login)
    await this.sessionRepo.create({
      userId,
      familyId,
      deviceId,
      userAgent,
      ip,
      refreshTokenId: tokens.refreshJti,
      lastSeenAt: new Date(),
    });

    return {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      familyId,
      isNewUser,
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
}