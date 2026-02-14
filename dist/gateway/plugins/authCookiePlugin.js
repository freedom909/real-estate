// src/gateway/plugins/authCookiePlugin.ts
import crypto from "crypto";
export function authCookiePlugin() {
    return {
        async requestDidStart() {
            return {
                async willSendResponse({ contextValue, response }) {
                    const { res } = contextValue;
                    if (!res)
                        return;
                    // Handle both regular and incremental response bodies
                    let responseData;
                    if ('singleResult' in response.body) {
                        // Regular response
                        responseData = response.body.singleResult?.data;
                    }
                    else if ('initialResult' in response.body) {
                        // Incremental response - only handle initial result
                        responseData = response.body.initialResult?.data;
                    }
                    else {
                        // Fallback for other response types
                        responseData = response.body.data;
                    }
                    if (!responseData)
                        return;
                    const payload = responseData.oauthLogin ||
                        responseData.refreshToken ||
                        responseData.logout ||
                        responseData.revokeToken;
                    if (!payload)
                        return;
                    /** ===== LOGOUT / REVOKE ===== */
                    if (payload === true) {
                        res.clearCookie("access_token"); // Removed options object
                        res.clearCookie("refresh_token"); // Removed options object
                        res.clearCookie("csrf_token"); // Removed options object
                        return;
                    }
                    /** ===== LOGIN / REFRESH ===== */
                    const { accessToken, refreshToken } = payload;
                    if (accessToken) {
                        res.cookie("access_token", accessToken, {
                            httpOnly: true,
                            sameSite: "none", // ✅ Required for Apollo Studio (Cross-Site)
                            secure: true, // ✅ Required when SameSite is none
                            path: "/",
                            maxAge: 2 * 60 * 60 * 1000,
                        });
                    }
                    if (refreshToken) {
                        res.cookie("refresh_token", refreshToken, {
                            httpOnly: true,
                            sameSite: "none", // ✅ Required for Apollo Studio (Cross-Site)
                            secure: true, // ✅ Required when SameSite is none
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
