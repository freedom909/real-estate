// src/subgraphs/auth/adapters/user.adapter.js
import userApi from "./userApi.js";

export default class UserAdapter {
  constructor({ userApi }) {
    this.userApi = userApi;
  }

  async findById(userId) {
    return this.userApi.getUserById(userId);
  }

  async findOrCreateByOAuth(oauthUser) {
    return this.userApi.findOrCreateByOAuth(oauthUser);
  }
}
