// auth/adapters/user.service.adapter.js

export default class UserServiceAdapter {
  constructor({ userApi }) {
    this.userApi = userApi;
  }

  findOrCreateByOAuth(oauthUser) {
    return this.userApi.findOrCreateByOAuth({
      provider: oauthUser.provider,// Code block is referenced from repository -  with filepath - d:\real-estate\src\subgraphs\auth\adapters\user-api.adapter.js
      providerUserId: oauthUser.providerUserId,
      email: oauthUser.email,
    });
  }
}
