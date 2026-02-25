// src/gateway/cookies/clearAuthCookies.ts

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "./cookieOptions.js";

export function clearAuthCookies(res) {
  res.clearCookie(
    "accessToken",
    accessCookieOptions
  );
  res.clearCookie(
    "refreshToken",
    refreshCookieOptions
  );
}
