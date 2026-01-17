// src/gateway/cookies/setAuthCookies.ts

import {
  accessCookieOptions,
  refreshCookieOptions,
} from "./cookieOptions.js";

export function setAuthCookies(
  res,
  { accessToken, refreshToken }
) {
  if (!accessToken) {
    throw new Error("setAuthCookies: accessToken missing");
  }

  res.cookie(
    "access_token",
    accessToken,
    accessCookieOptions
  );

  if (refreshToken) {
    res.cookie(
      "refresh_token",
      refreshToken,
      refreshCookieOptions
    );
  }
}
