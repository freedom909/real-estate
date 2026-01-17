
export function authCookiePlugin() {
  return {
    async requestDidStart() {
      return {
        async willSendResponse({ contextValue, response }) {
          const res = contextValue.res;
          if (!res) return;

          const data = response.body?.singleResult?.data;
          if (!data) return;

          /** ===== LOGIN ===== */
          if (data.oauthLogin) {
            const { accessToken, refreshToken } = data.oauthLogin;

            if (accessToken) {
              res.cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
              });
            }

            if (refreshToken) {
              res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
              });
            }
          }

          /** ===== REFRESH ===== */
          if (data.refreshToken) {
            const { accessToken } = data.refreshToken;

            if (accessToken) {
              res.cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
              });
            }
          }

          /** ===== LOGOUT ===== */
          if (data.logout === true || data.revokeToken === true) {
            res.clearCookie("access_token");
            res.clearCookie("refresh_token");
            res.clearCookie("csrf_token");
          }
        },
      };
    },
  };
}

