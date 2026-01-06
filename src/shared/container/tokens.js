// src/shared/container/tokens.js
export const TOKENS = {
  // auth
  oauthService: Symbol("oauthService"),
  authService: Symbol("authService"),
  tokenService: Symbol("tokenService"),
  refreshTokenService: Symbol("refreshTokenService"),
  refreshTokenRepo: Symbol("refreshTokenRepo"),

  // cross-subgraph
  userClient: Symbol("userClient"),

  // user subgraph internal
  userRepo: Symbol("userRepo"),
  userService: Symbol("userService"),
};
