// src/subgraphs/auth/services/oauth/oauth.service.ts


interface OAuthServiceDeps {
  oauthAdapter: any;
  oauthAccountRepo: any;
  userRepo: any;
  oauthVerifier: any;
}

export default class OAuthService {
  constructor(private deps: OAuthServiceDeps) {}

  async login(provider: string, idToken: string) {
    console.log("App token:", idToken);
    const { oauthAdapter, oauthAccountRepo, userRepo } = this.deps;

    // 1️⃣ 验证第三方 token
    const profile = await oauthAdapter.verify(provider, idToken);
        console.log("profile:",profile);

    if (!profile?.email) {
      throw new Error("Invalid OAuth profile");
    }

    // 2️⃣ 查找 OAuth 账户
    let oauthAccount = await oauthAccountRepo.findByProviderId(
      provider,
      profile.providerId
    );

    let user;

    if (!oauthAccount) {
      // 3️⃣ 如果不存在 → 查 email 是否已注册
      user = await userRepo.findByEmail(profile.email);

      if (!user) {
        // 4️⃣ 创建用户
        user = await userRepo.create({
          email: profile.email,
          role: "USER",
          status: "ACTIVE",
        });
      }

      // 5️⃣ 创建 OAuthAccount
      await oauthAccountRepo.create({
        provider,
        providerId: profile.providerId,
        userId: user.id,
      });
    } else {
      user = await userRepo.findById(oauthAccount.userId);
    }

    return user;
  }
}