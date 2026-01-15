import User from '../models/user.model.js'

export default {
  findById(id) {
    return User.findById(id)
  },

  findByEmail(email) {
    return User.findOne({ email })
  },

  create(data) {
    return User.create({
      email: data.email,
      emailVerified: data.emailVerified ?? true,
      name: data.name,
      avatar: data.avatar,
      provider: data.provider,
      providerSub: data.providerSub
    })
  },

  // UserRepo
async findOrCreateUserByEmail({ email, fullname, picture }) {
  let user = await this.findByEmail(email);
  if (!user) {
    user = await this.create({ email, fullname, picture });
  }
  return user;
},

// ❗ UserRepo — 临时兼容接口
async findOrCreateOAuthUser(input) {
  console.warn(
    "[DEPRECATED] findOrCreateOAuthUser is deprecated. Use AuthService.oauthLogin instead."
  );

  const { email, fullname, picture, provider, providerSub } = input;

  // 1️⃣ 找 / 建 user
  let user = await this.findByEmail(email);
  if (!user) {
    user = await this.create({ email, fullname, picture });
  }

  return user; // ⚠️ 只返回 User
}

}
