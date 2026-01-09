export const TOKENS = {
  // infra
  redis: Symbol("redis"),
  userClient: Symbol("userClient"),

  // repos
  userRepo: Symbol("userRepo"),
  credentialRepo: Symbol("credentialRepo"),
  refreshTokenRepo: Symbol("refreshTokenRepo"),
  riskEventRepo: Symbol("riskEventRepo"),

  // services
  tokenService: Symbol("tokenService"),
  refreshTokenService: Symbol("refreshTokenService"),
  loginRiskService: Symbol("loginRiskService"),
  oauthService: Symbol("oauthService"),
  authService: Symbol("authService"),
};
