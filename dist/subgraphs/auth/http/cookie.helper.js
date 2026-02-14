export function setRefreshTokenCookie(res, refreshToken) {
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
}
export function setCsrfCookie(res, csrfToken) {
    res.cookie("csrf_token", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
    });
}
