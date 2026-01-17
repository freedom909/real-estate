import { setAuthCookies } from "../cookies/setAuthCookies.js";

export function authCookiePlugin() {
  return {
    async requestDidStart() {
      return {
        async willSendResponse(ctx) {
          // 🔒 防御 1：context 可能不存在
          const context = ctx.contextValue;
          if (!context) return;

          // 🔒 防御 2：res 可能不存在
          const res = context.res;
          if (!res) return;

          const response = ctx.response;

          // 🔒 防御 3：只处理普通 GraphQL response
          if (!response?.body || response.body.kind !== "single") {
            return;
          }

          const data = response.body.singleResult?.data;
          if (!data) return;

          // 统一检测 login, oauthLogin, refreshToken 等返回
          const payload = data.oauthLogin || data.refreshToken || data.login;

          if (payload?.accessToken) {
            setAuthCookies(res, payload);
          }
        },
      };
    },
  };
}
