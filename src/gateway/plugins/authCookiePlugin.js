

// src/gateway/plugins/authCookiePlugin.ts
import crypto from "crypto";

export function authCookiePlugin() {
  return {
    async requestDidStart() {
      return {
        async willSendResponse(context) {
          const { res } = context.contextValue;
          if (!res) return;

          const data = context.response.body?.singleResult?.data;
          if (!data) return;

          const payload =
            data.oauthLogin ||
            data.refreshToken ||
            data.logout ||
            data.revokeToken;

          if (!payload) return;

          /** ===== LOGOUT / REVOKE ===== */
          if (payload === true) {
            res.clearCookie("access_token", { path: "/" });
            res.clearCookie("refresh_token", { path: "/" });
            res.clearCookie("csrf_token", { path: "/" });
            return;
          }

          /** ===== LOGIN / REFRESH ===== */
          const { accessToken, refreshToken } = payload;

          if (accessToken) {
            res.cookie("access_token", accessToken, {
              httpOnly: true,
              sameSite: "none", // ✅ Required for Apollo Studio (Cross-Site)
              secure: true,     // ✅ Required when SameSite is none
              path: "/",
              maxAge: 15 * 60 * 1000,
            });
          }

          if (refreshToken) {
            res.cookie("refresh_token", refreshToken, {
              httpOnly: true,
              sameSite: "none", // ✅ Required for Apollo Studio (Cross-Site)
              secure: true,     // ✅ Required when SameSite is none
              path: "/",
              maxAge: 30 * 24 * 60 * 60 * 1000,
            });
          }

          /** ===== CSRF ===== */
          const csrf = crypto.randomBytes(16).toString("hex");
          res.cookie("csrf_token", csrf, {
            httpOnly: false,
            sameSite: "none",
            secure: true,
            path: "/",
          });
        },
      };
    },
  };
}
