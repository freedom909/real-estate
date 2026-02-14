// src/gateway/cookies/cookieOptions.ts

const isProd = process.env.NODE_ENV === "production";

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'none' | 'lax' | 'strict';
  path: string;
  maxAge?: number;
}

export const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
};