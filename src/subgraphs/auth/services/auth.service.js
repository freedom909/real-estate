// src/subgraphs/auth/services/auth.service.js
import mapOAuthProfileToUserInput from "../acl/oauthUserMapper.js";
import { debugAuth } from "../../../shared/debug.js";


export default class AuthService {
  constructor({
    oauthService,
    userClient,
    tokenService,
    refreshTokenService,
    credentialRepo,
    loginRiskService,
  }) {
    if (!oauthService || !userClient || !tokenService || !refreshTokenService || !loginRiskService || !credentialRepo) {
      throw new Error("Missing oauthService, userClient, tokenService, refreshTokenService, loginRiskService, or credentialRepo");
    }
    this.oauthService = oauthService;
    this.userClient = userClient;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
    this.loginRiskService = loginRiskService;
    this.credRepo = credentialRepo;
  }

  async oauthLoginWithIdToken(provider, idToken) {
    debugAuth("OAuth login start", { provider });

    // 1️⃣ OAuth 验证
    const oauthProfile = await this.oauthService.verify(
      provider,
      idToken
    );

    debugAuth("OAuth verified", {
      provider,
      sub: oauthProfile.sub,
      email: oauthProfile.email,
    });

    // 2️⃣ ACL 翻译
    const userInput =
      mapOAuthProfileToUserInput(oauthProfile);

    debugAuth("OAuth mapped to domain user", {
      email: userInput.email,
    });

    // 3️⃣ 用户查找
    const user =
      await this.userClient.findOrCreateOAuthUser(
        userInput
      );

    debugAuth("User resolved", {
      userId: user.id,
      email: user.email,
    });

    // 4️⃣ Token
    const accessToken =
      this.tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

    const refreshToken =
      this.tokenService.generateRefreshToken({
        userId: user.id,
      });

    await this.refreshTokenService.save(
      user.id,
      refreshToken
    );

    debugAuth("OAuth login success", {
      userId: user.id,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // =======================
  // REGISTER
  // =======================
  async register({ email, password }) {
    // 1️⃣ email 是否已存在
    const existingUser = await this.userClient.findByEmail(email);
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // 2️⃣ 创建 User
    const user = await this.userClient.createUser({
      email,
      role: "USER",
    });

    // 3️⃣ 创建 PASSWORD credential
    await this.credentialRepo.createPassword({
      userId: user.userId,
      password,
    });

    // 4️⃣ 签发 token
    return this.tokenService.issueAuthTokens(user.userId);
  }

  // =======================
  // LOGIN
  // =======================

  async login({ email, password }) {
    // 1️⃣ 找 credential
    const credential =
      await this.credentialRepo.findPasswordByEmail(
        email,
        this.userClient
      );

    if (!credential) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // 2️⃣ 校验密码
    const ok = await this.credentialRepo.verifyPassword(
      credential,
      password
    );

    if (!ok) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // 3️⃣ 发 token
    return this.tokenService.issueAuthTokens(credential.userId);
  }

  async oauthLogin({ provider, profile }) {
    const { sub, email, emailVerified, name, picture } = profile;

    // 1️⃣ 已有 identity？
    let credential = await this.credentialRepo.findByProvider(
      provider,
      sub
    );

    if (credential) {
      return this.issueTokens(credential.userId);
    }

    // 2️⃣ email 是否已有 user？
    let user = null;
    if (email && emailVerified) {
      user = await this.userClient.findByEmail(email);
    }

    // 3️⃣ 没 user → 创建
    if (!user) {
      user = await this.userClient.createUser({
        email,
        fullname: name,
        picture,
      });
    }

    // 4️⃣ 绑定 identity
    await this.credentialRepo.createOAuth({
      userId: user.userId,
      provider,
      providerSub: sub,
    });

    return this.issueTokens(user.userId);
  }

  async refresh({ refreshToken, ip, userAgent }) {
    const newRefreshToken =
      await this.refreshTokenService.rotate({
        refreshToken,
        ip,
        userAgent,
      });

    const payload =
      this.tokenService.verifyRefreshToken(newRefreshToken);

    const accessToken =
      this.tokenService.signAccessToken({
        sub: payload.sub,
      });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }


  async loginWithPassword({ email, password }) {
    const credential =
      await this.credentialRepo.findPasswordByEmail(email);

    if (!credential) {
      throw new Error("Invalid credentials");
    }

    const ok = await this.passwordCredential.verify({
      password,
      passwordHash: credential.passwordHash,
    });

    if (!ok) {
      throw new Error("Invalid credentials");
    }

    const userId = await this.credService.loginWithPassword(email, password)
    const user = await User.findById(userId)
    return user
  }
}

