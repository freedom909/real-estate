// src/subgraphs/auth/services/auth.service.js
import mapOAuthProfileToUserInput from "../acl/oauthUserMapper.js";
import { debugAuth } from "../../../shared/debug.js";

export default class AuthService {
  constructor({
    oauthService,
    userClient,
    tokenService,
    refreshTokenService,
    loginRiskService,
  }) {
    this.oauthService = oauthService;
    this.userClient = userClient;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
    this.loginRiskService = loginRiskService;
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
}
