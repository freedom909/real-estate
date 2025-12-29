//src/core/auth/services/auth.service.js

import normalizeRole from "../../user/domain/normalizeRole";

export default class AuthService {
  constructor({ userRepository, tokenService }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }
async oauthLogin(provider, token) {
  const user = await this.userRepository.findOrCreateOAuthUser(provider, token);
  user.role = normalizeRole(user.profile.role);

  return {
    user,
    accessToken: this.tokenService.sign(user),
  };
}
}
