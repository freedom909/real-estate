// src/gateway/cookies/clearAuthCookies.ts

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "./cookieOptions.js";

export function clearAuthCookies(res) {
  res.clearCookie(
    "access_token",
    accessCookieOptions
  );
  res.clearCookie(
    "refresh_token",
    refreshCookieOptions
  );
}
