import { Response } from 'express';

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function setCsrfCookie(res: Response, csrfToken: string) {
  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
  });
}