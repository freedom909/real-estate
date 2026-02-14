async function verifyGithubCode(code) {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
        body: new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        throw new Error("Failed to obtain GitHub access token");
    }
    const userRes = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });
    const profile = await userRes.json();
    return {
        provider: "GITHUB",
        providerUserId: profile.id.toString(),
        email: profile.email,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
    };
}
export default verifyGithubCode;
