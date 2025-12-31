
// subgraphs/auth/cookies/setRefreshCookie.ts

export function setRefreshCookie(
  res,
  refreshToken,
  options
) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,                 // JS 不能读
    secure: options.secure ?? isProd, // https 才发送（prod）
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: options.maxAge ?? 1000 * 60 * 60 * 24 * 30, // 30 天
  });
}
