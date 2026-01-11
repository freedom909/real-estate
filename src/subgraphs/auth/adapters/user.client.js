export default class UserClient {
  constructor({userApi}) {
    if (!userApi) {
      throw new Error("UserClient: userApi is required");
    }
    this.userApi = userApi;
  }
  async findByEmail(email) {
    const user = await this.userApi.userByEmail(email);
    if (!user) return null;

    return {
      userId: user.userId, // ⚠️ 注意统一字段
      email: user.email,
      role: user.role,
    };
  }


  async findOrCreateOAuthUser(input) {
    return this.userApi.findOrCreateByOAuth(input);
  }

  async createUser(input) {
    return this.userApi.createUser(input);
  }
}
