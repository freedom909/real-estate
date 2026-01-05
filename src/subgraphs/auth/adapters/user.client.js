export default class UserClient {
  async findUserByEmail(email) {
    if (!email) {
      throw new Error("UserClient.findUserByEmail: email is required");
    }

    // ✅ 最小可跑：先假装用户存在
    return {
      id: "user-1",
      email,
      role: "USER",
    };
  }
}
