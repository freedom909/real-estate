// src/subgraphs/auth/oauth/oauth.service.js

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
const googleJwksClient = jwksClient({
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
});

function getGoogleKey(header, callback) {
    googleJwksClient.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

class OAuthService {
    async verify(provider, code) {
        switch (provider) {
            case "google":
                return this.verifyGoogle(code);
            case "github":
                return this.verifyGithub(code);
            case "facebook":
                return this.verifyFacebook(code);
            default:
                throw new Error("Unsupported OAuth provider");
        }
    }

    async verifyGoogle(code) {
        console.log("Verifying Google OAuth code:", code);
        if (!code) {
            throw new Error("Missing OAuth code");
        }
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            }),
        });
        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            throw new Error(`Google token exchange failed: ${err}`);
        }
        const { id_token } = await tokenRes.json();
        if (!id_token) {
            throw new Error("Missing id_token from Google");
        }
        const payload = await new Promise((resolve, reject) => {
            jwt.verify(
                id_token,
                getGoogleKey,
                {
                    audience: process.env.GOOGLE_CLIENT_ID,
                    issuer: ["https://accounts.google.com", "accounts.google.com"],
                },
                (err, decoded) => {
                    if (err) reject(err);
                    else resolve(decoded);
                }
            );
        });
        return {
            provider: "google",
            providerUserId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture,
        };
    }

    async verifyGithub(code) {
        if (!code) {
            throw new Error("Missing OAuth code");
        }
        // 1️⃣ 用 code 换 access_token
        const tokenRes = await fetch(
            "https://github.com/login/oauth/access_token",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: new URLSearchParams({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                }),
            }
        );
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            throw new Error("Failed to exchange GitHub access token");
        }
        const accessToken = tokenData.access_token;
        // 2️⃣ 获取用户信息
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });
        const user = await userRes.json();
        if (!user || user.message) {
            throw new Error("Invalid GitHub access token");
        }
        // 3️⃣ 获取邮箱（如果非公开）
        let email = user.email;
        if (!email) {
            const emailRes = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json",
                },
            });

            const emails = await emailRes.json();
            const primary = emails.find(
                (e) => e.primary && e.verified
            );
            email = primary?.email;
        }
        if (!email) {
            throw new Error("GitHub email not found");
        }
        return {
            provider: "github",
            providerUserId: user.id.toString(),
            email,
            name: user.name || user.login,
            avatar: user.avatar_url,
        };
    }

    async verifyFacebook(code) {
        if (!code) {
            throw new Error("Missing OAuth code");
        }
        // 1️⃣ 用 code 换 access_token
        const tokenRes = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?` +
            new URLSearchParams({
                client_id: process.env.FACEBOOK_CLIENT_ID,
                client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
                code,
            })
        );
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            throw new Error("Failed to exchange Facebook access token");
        }
        const accessToken = tokenData.access_token;
        // 2️⃣ 获取用户信息
        const userRes = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
        );
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

}

export default OAuthService;


