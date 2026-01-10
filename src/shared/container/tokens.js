export const TOKENS = {
  infra: {
    redis: Symbol("infra.redis"),
    mongodb: Symbol("infra.mongodb"),
  },

  auth: {
    authService: Symbol("auth.authService"),
    tokenService: Symbol("auth.tokenService"),
    credentialModel: Symbol("auth.credentialModel"),
    credentialRepo: Symbol("auth.credentialRepo"),
    refreshTokenService: Symbol("auth.refreshTokenService"),
    refreshTokenRepo: Symbol("auth.refreshTokenRepo"),
    oauthService: Symbol("auth.oauthService"),
    userClient: Symbol("auth.userClient"),
    loginRiskService: Symbol("auth.loginRiskService"),
    riskEventRepo: Symbol("auth.riskEventRepo"),
  },

  user: {
    userService: Symbol("user.userService"),
    userRepo: Symbol("user.userRepo"),
    profileRepo: Symbol("user.profileRepo"),
    profileService: Symbol("user.profileService"),
  },
};
