// src/subgraphs/auth/services/oauth/oauth.service.js

import User from "../../models/user.model.js";
import Credential from "../../credentials/Credential.js"

export default class OAuthService {
  constructor({ userRepo, credentialRepo }) {
    this.userRepo = userRepo;
    this.credentialRepo = credentialRepo;
  }

  async findOrCreateOAuthUser(input) {
    const {
      provider,
      providerUserId,
      email,
      emailVerified,
      profile,
    } = input;

    // 1️⃣ provider 唯一匹配
    let credential =
      await this.credentialRepo.findByProvider(provider, providerUserId);

    if (credential) {
      await this.credentialRepo.updateLastLogin(credential.id);
      return credential.userId;
    }

    // 2️⃣ email 合并
    let user = email
      ? await this.userRepo.findByEmail(email)
      : null;

    // 3️⃣ 新用户
    if (!user) {
      user = await this.userRepo.create({
        email,
        emailVerified: !!emailVerified,
      });
    }

    // 4️⃣ 创建 credential
    await this.credentialRepo.create({
      userId: user.id,
      provider,
      providerUserId,
      email,
      emailVerified,
      profile,
    });

    return user.id;
  }

  async loginOrRegister(profile) {
  const {
    provider,
    providerUserId,
    email,
    emailVerified,
  } = profile;

  // 1️⃣ provider 已存在
  const credential =
    await this.credentialRepo.findOAuth(
      provider,
      providerUserId
    );

  if (credential) {
    return this.userRepo.findById(credential.userId);
  }

  // 2️⃣ email 不可信
  if (!email || !emailVerified) {
    return this.createOAuthOnlyUser(profile);
  }

  // 3️⃣ email 已存在 → 合并
  const user = await this.userRepo.findByEmail(email);

  if (user) {
    await this.credentialRepo.createOAuthCredential({
      userId: user.id,
      provider,
      providerUserId,
    });
    return user;
  }

  // 4️⃣ 全新用户
  const newUser = await this.userRepo.create({ email });

  await this.credentialRepo.createOAuthCredential({
    userId: newUser.id,
    provider,
    providerUserId,
  });

  return newUser;
}

}


