// src/gateway/cookies/clearAuthCookies.ts

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "./cookieOptions.js";

interface Response {
  clearCookie: (name: string, options?: any) => void;
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(
    "access_token",
    accessCookieOptions
  );
  res.clearCookie(
    "refresh_token",
    refreshCookieOptions
  );
}