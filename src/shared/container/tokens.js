export const TOKENS = {
  oauthService: Symbol("oauthService"),
  authService: Symbol("authService"),

  // ✅ 新增
  userClient: Symbol("userClient"),

  // 你原来的
  tokenService: Symbol("tokenService"),
  refreshTokenService: Symbol("refreshTokenService"),
  userApi: Symbol("userApi"),
  userRepo: Symbol("userRepo"),
  userService: Symbol("userService"),
};
