export function authCookiePlugin() {
    return {
        async requestDidStart() {
            return {
                async willSendResponse({ contextValue, response }) {
                    const res = contextValue.res;
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
                    /** ===== LOGIN ===== */
                    if (responseData.oauthLogin) {
                        const { accessToken, refreshToken } = responseData.oauthLogin;
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
                    if (responseData.refreshToken) {
                        const { accessToken } = responseData.refreshToken;
                        if (accessToken) {
                            res.cookie("access_token", accessToken, {
                                httpOnly: true,
                                sameSite: "lax",
                                path: "/",
                            });
                        }
                    }
                    /** ===== LOGOUT ===== */
                    if (responseData.logout === true || responseData.revokeToken === true) {
                        res.clearCookie("access_token");
                        res.clearCookie("refresh_token");
                        res.clearCookie("csrf_token");
                    }
                },
            };
        },
    };
}
