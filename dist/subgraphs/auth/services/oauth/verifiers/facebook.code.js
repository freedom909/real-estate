async function verifyFacebookCode(code) {
    if (!code) {
        throw new Error("Missing OAuth code");
    }
    // 1️⃣ Exchange code for access_token
    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
            code,
        }));
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        throw new Error("Failed to exchange Facebook access token");
    }
    const accessToken = tokenData.access_token;
    // 2️⃣ Get user info
    const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const user = await userRes.json();
    if (!user || user.error) {
        throw new Error("Invalid Facebook access token");
    }
    if (!user.email) {
        throw new Error("Facebook email permission missing");
    }
    return {
        provider: "facebook",
        providerUserId: user.id,
        email: user.email,
        name: user.name,
        avatar: user.picture?.data?.url || null,
    };
}
export default verifyFacebookCode;
