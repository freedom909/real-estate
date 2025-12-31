// src/subgraphs/auth/adapters/userAdapter.js
class UserAdapter {
  constructor({ userApi }) {
    this.userApi = userApi;
  }

  findOrCreate(oauthUser) {
    return this.userApi.findOrCreateByOAuth(oauthUser);
  }

  findById(id) {
    return this.userApi.findById(id);
  }
}
export default UserAdapter;