// future: riskPolicy.service.js
if (
  count(
    refreshToken_REUSE,
    last24h
  ) >= 1
) {
  // 直接封号 or 强制重新登录
}
