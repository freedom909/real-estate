export const TOKENS = {
  infra: {
    redis: Symbol("infra.redis"),
  },

  auth: {
    // adapters
    userApi: Symbol("auth.userApi"),
    userClient: Symbol("auth.userClient"),

    // models
    credentialModel: Symbol("auth.credentialModel"),
    refreshTokenModel: Symbol("auth.refreshTokenModel"),

    // repos
    credentialRepo: Symbol("auth.credentialRepo"),
    refreshTokenRepo: Symbol("auth.refreshTokenRepo"),
    riskEventRepo: Symbol("auth.riskEventRepo"),

    // services
    tokenService: Symbol("auth.tokenService"),
    refreshTokenService: Symbol("auth.refreshTokenService"),
    oauthService: Symbol("auth.oauthService"),
    loginRiskService: Symbol("auth.loginRiskService"),
    authService: Symbol("auth.authService"),
  },

    user: {
    userService: Symbol("user.userService"),
    userRepo: Symbol("user.userRepo"),
    profileRepo: Symbol("user.profileRepo"),
  },
};
