// src/subgraphs/user/repositories/user.repository.js
import { BaseRepository } from "./base.repository.js";

export class UserRepository extends BaseRepository {
  constructor() {
    this.users = [];
  }

  async findById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email) {
    return this.users.find(u => u.email === email) || null;
  }

  async findByOAuth(provider, providerUserId) {
    return (
      this.users.find(u =>
        u.oauthAccounts?.some(
          oa =>
            oa.provider === provider &&
            oa.providerUserId === providerUserId
        )
      ) || null
    );
  }

  async create({ email, role, oauthAccounts }) {
    const user = {
      id: crypto.randomUUID(),
      email,
      role,
      oauthAccounts,
    };

    this.users.push(user);
    return user;
  }

  async bindOAuth(userId, oauthAccount) {
    const user = await this.findById(userId);
    if (!user) return null;

    user.oauthAccounts = user.oauthAccounts || [];
    user.oauthAccounts.push(oauthAccount);

    return user;
  }
}

export default UserRepository;
