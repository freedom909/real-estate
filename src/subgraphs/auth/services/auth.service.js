// src/subgraphs/auth/services/auth.service.js
import mapOAuthProfileToUserInput from "../acl/oauthUserMapper.js";

export default class AuthService {
  constructor({
    oauthService,
    userClient,
    tokenService,
    refreshTokenService,
  }) {
    this.oauthService = oauthService;
    this.userClient = userClient;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
  }

  async oauthLoginWithIdToken(provider, idToken) {
    // 1️⃣ OAuth 验证
    const oauthProfile = await this.oauthService.verify(
      provider,
      idToken
    );

    // 2️⃣ ACL 翻译
    const userInput = mapOAuthProfileToUserInput(oauthProfile);

    // 3️⃣ 用户查找（先用 mock / email）
    const user =
      (await this.userClient.findUserByEmail(userInput.email)) ??
      {
        id: "user-1",
        email: userInput.email,
        role: "USER",
      };

    // 4️⃣ 生成 token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
   console.log("accessToken:", accessToken);
    const refreshToken =
      this.tokenService.generateRefreshToken({
        userId: user.id,
      });

    // 5️⃣ 可选：保存 refresh token
    await this.refreshTokenService.save(
      user.id,
      refreshToken
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}

