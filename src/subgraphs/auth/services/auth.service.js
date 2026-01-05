// src/subgraphs/auth/services/auth.service.js
import mapOAuthProfileToUserInput from "../acl/oauthUserMapper.js";

export default class AuthService {
  constructor({ oauthService, userClient, tokenService, refreshTokenService }) {
    this.oauthService = oauthService;
    this.userClient = userClient;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
  }

  async oauthLoginWithIdToken({ provider, idToken }) {
    // 1️⃣ 外部世界
    const oauthProfile = await this.oauthService.verify(provider, idToken);

    // 2️⃣ ACL 翻译（关键）
    const userInput = mapOAuthProfileToUserInput(oauthProfile);

    // 3️⃣ 内部世界
    const user = await this.userClient.findUserByEmail(userInput.email);// where should this method be written in, in the frontend or repository?

    // 4️⃣ 业务流程
    // 4️⃣ 最小返回（能跑）
    return {
      user,
      accessToken: "access-token-demo",
      refreshToken: "refresh-token-demo",
    };
  }
}
