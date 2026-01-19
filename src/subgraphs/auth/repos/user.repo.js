import User from '../models/user.model.js'
import { createRedis } from "../../../infrastructure/redis/redis.js";

export default class UserRepo {
  constructor({ UserModel, redis }) {
    this.UserModel = UserModel;
    this.redis = redis || createRedis();
  }
  /**
  * Get the current token version for a user (from Redis cache)
  */
  async getTokenVersion(userId) {
    const key = `user:${userId}:tokenVersion`;

    // 1️⃣ Try Redis first
    let version = await this.redis.get(key);
    if (version !== null) {
      return parseInt(version, 10);
    }

    // 2️⃣ Fallback: fetch from DB
    const user = await this.UserModel.findById(userId).select("tokenVersion");
    version = user?.tokenVersion ?? 0;

    // 3️⃣ Cache in Redis for next time (TTL: e.g., 1 hour)
    await this.redis.set(key, version, "EX", 60 * 60);

    return version;
  }

  /**
   * Increment token version (invalidate all existing refresh tokens)
   */
  async incrementTokenVersion(userId) {
    // Increment in DB
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    );

    // Update Redis cache
    const key = `user:${userId}:tokenVersion`;
    await this.redis.set(key, user.tokenVersion, "EX", 60 * 60);

    return user.tokenVersion;
  }


  // UserRepo
  async findOrCreateUserByEmail({ email, fullname, picture }) {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create({ email, fullname, picture });
    }
    return user;
  }

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
  findById(id) {
    return User.findById(id)
  }

  findByEmail(email) {
    return User.findOne({ email })
  }

  create(data) {
    return User.create({
      email: data.email,
      emailVerified: data.emailVerified ?? true,
      name: data.name,
      avatar: data.avatar,
      provider: data.provider,
      providerSub: data.providerSub
    })
  }
}
