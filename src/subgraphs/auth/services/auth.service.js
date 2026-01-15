// src/subgraphs/auth/services/auth.service.js

export default class AuthService {
constructor({
    oauthService,
    userClient,       // ✅ ACL
    credentialRepo,
    tokenService,
    refreshTokenService,
    loginRiskService,
    oauthAccountRepo,
  }) {
    this.oauthService = oauthService;
    this.userClient = userClient;
    this.credentialRepo = credentialRepo;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
    this.loginRiskService = loginRiskService;
    this.oauthAccountRepo = oauthAccountRepo
  }

  /**
   * =====================================================
   * 🔐 OAuth Login (NO TRANSACTION)
   * =====================================================
   */
   // AuthService.js
async oauthLoginWithIdToken(provider, idToken, context = {}) {
  const oauthUser =
    await this.oauthService.verifyIdToken(provider, idToken);

  const {
    sub: providerSub,
    email,
    emailVerified,
    name,
    picture,

  } = oauthUser;

  if (!providerSub) {
    throw new Error("INVALID_OAUTH_TOKEN");
  }

  // 1️⃣ Fast path: credential login
  const existingCred =
    await this.credentialRepo.findByProviderSub({
      provider,
      providerSub,
    });

  if (existingCred) {
    return this._login(existingCred.userId, context);
  }

  // 2️⃣ Find user by verified OAuth email (via ACL)
  let user = null;

  if (email && emailVerified) {
    user = await this.userClient.findByEmail(email);//invalid url
  }

  // 3️⃣ Create OAuth-only user if not exists
  if (!user) {
    user = await this.userClient.createOAuthUser({
      email,
      profile: {
        name,
        avatar: picture,
      },
      provider,
    });
  }

  // 4️⃣ Bind credential
  await this.credentialRepo.create({
    userId: user.id,
    provider,
    providerSub,
    email,
    source: "OAUTH_LOGIN",
  });

  return this._login(user.id, context);
}

// auth.service.js
async oauthLogin(profile, meta) {
  const {
    provider,
    providerUserId,
    email,
    name,
    avatar,
  } = profile;

  let oauthAccount =
    await this.oauthAccountRepo.findByProviderUserId( //undefined
      provider,
      providerUserId
    );

  let userId;
  let isNewUser = false;

  if (oauthAccount) {
    userId = oauthAccount.userId;
  } else {
    const user = email
      ? await this.userClient.findByEmail(email)
      : null;

    if (user) {
      userId = user.id;

      await this.oauthAccountRepo.create({
    userId,
    provider,
    providerUserId,
    email,
  });
    } else {
      const created = await this.userClient.createOAuthUser({
        email,
        profile: { name, avatar },
      });

      userId = created.id;
      isNewUser = true;
    }
  }

  const tokens = await this.tokenService.issueTokens({userId});// 

  return {
    userId,
    isNewUser,
    ...tokens,
  };
}


  async _login(userId, ctx, isNewUser) {
    const { ip, deviceId, userAgent} = ctx;
    await this.loginRiskService.record({ //
    type: "LOGIN",
    userId,
    ip,
    userAgent,
    severity: "LOW",
    });

    const tokens = await this.tokenService.issueTokens({
      userId,
    });
  console.log("tokens:", tokens)
    return {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewUser,
    };
  }

  /**
   * =====================================================
   * 🔗 Bind OAuth Provider (NO TRANSACTION)
   * =====================================================
   */
  async bindOAuthAccount(provider, idToken, { userId, ip, deviceId }) {
    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    const oauth =
      await this.oauthService.verifyIdToken(provider, idToken);

    const { sub, email, emailVerified } = oauth;

    if (!sub) {
      throw new Error("INVALID_OAUTH_TOKEN");
    }

    if (email && !emailVerified) {
      throw new Error("OAUTH_EMAIL_NOT_VERIFIED");
    }

    const existing =
      await this.credentialRepo.findByProviderSub({
        provider,
        providerSub: sub,
      });

    if (existing && existing.userId !== userId) {
      throw new Error("OAUTH_ALREADY_BOUND_TO_OTHER_USER");
    }

    if (!existing) {
      await this.credentialRepo.createIfNotExists({
        userId,
        provider,
        providerSub: sub,
        email,
        source: "USER_BIND",
      });
    }

    await this.loginRiskService.recordEvent({
      userId,
      type: "BIND_OAUTH",
      provider,
      ip,
      deviceId,
    });

    return true;
  }

  /**
   * =====================================================
   * ❌ Unbind OAuth Provider (NO TRANSACTION)
   * =====================================================
   */
  async unbindOAuthAccount(provider, { userId, ip, deviceId }) {
    if (!userId) {
      throw new Error("UNAUTHORIZED");
    }

    const credentials =
      await this.credentialRepo.findByUserId(userId);

    if (!credentials.length) {
      throw new Error("NO_CREDENTIAL_FOUND");
    }

    if (credentials.length === 1) {
      throw new Error("CANNOT_UNBIND_LAST_OAUTH");
    }

    const target = credentials.find(
      (c) => c.provider === provider
    );

    if (!target) {
      throw new Error("OAUTH_NOT_BOUND");
    }

    await this.credentialRepo.deleteById(target.id);

    await this.loginRiskService.recordEvent({
      userId,
      type: "UNBIND_OAUTH",
      provider,
      ip,
      deviceId,
    });

    return true;
  }
}
