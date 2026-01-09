// src/subgraphs/auth/services/auth.service.js
import mapOAuthProfileToUserInput from "../acl/oauthUserMapper.js";
import { debugAuth } from "../../../shared/debug.js";
import User from '../models/user.model.js'
import CredentialService from './credential/credential.service.js'

export default class AuthService {
  constructor({
    oauthService,
    userClient,
    tokenService,
    refreshTokenService,
    loginRiskService,
    credentialService,
  }) {
    this.oauthService = oauthService;
    this.userClient = userClient;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
    this.loginRiskService = loginRiskService;
    this.credService = credentialService
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

  async register(email, password) {
    // 1️⃣ Create user
    const user = await User.create({ email })
    // 2️⃣ Create password credential
    await this.credService.registerPassword(user._id, email, password)
    return user
  }

  async login(email, password) {
    const userId = await this.credService.loginWithPassword(email, password)
    const user = await User.findById(userId)
    return user
  }

  async oauthLogin(provider, providerUserId, email) {
    let cred = await this.credService.findOAuth(provider, providerUserId)
    if (cred) return User.findById(cred.userId)

    // merge by email
    let user = null
    if (email) user = await User.findOne({ email })

    if (!user) user = await User.create({ email })
    await this.credService.registerOAuth(user._id, provider, providerUserId)
    return user
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

