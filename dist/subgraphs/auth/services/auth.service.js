// src/subgraphs/auth/services/auth.service.ts
import { randomUUID } from "crypto";
export default class AuthService {
    constructor(deps) {
        const required = [
            "oauthService",
            "userClient",
            "credentialRepo",
            "tokenService",
            "loginRiskService",
            "refreshTokenRepo",
            "oauthAccountRepo",
            "sessionRepo",
        ];
        for (const key of required) {
            if (!deps[key]) {
                throw new Error(`AuthService missing dependency: ${String(key)}`);
            }
        }
        Object.assign(this, deps);
    }
    /**
     * =====================================================
     * 🔐 OAuth Login (Profile-based, legacy / frontend)
     * =====================================================
     */
    async oauthLogin(profile, ctx = {}) {
        const familyId = randomUUID();
        const { provider, providerUserId, email, name, avatar, } = profile;
        let oauthAccount = await this.oauthAccountRepo.findByProviderUserId(provider, providerUserId);
        let userId;
        let isNewUser = false;
        if (oauthAccount) {
            userId = oauthAccount.userId;
        }
        else {
            let user = null;
            if (email) {
                user = await this.userClient.findByEmail(email);
            }
            if (user) {
                userId = user.id;
                await this.oauthAccountRepo.create({
                    userId,
                    provider,
                    providerUserId,
                    email,
                    familyId,
                });
            }
            else {
                const created = await this.userClient.createOAuthUser({
                    email,
                    familyId,
                    profile: { name, avatar },
                });
                userId = created.id;
                isNewUser = true;
            }
        }
        return this._login(userId, { ...ctx, familyId }, isNewUser);
    }
    /**
     * =====================================================
     * 🔑 Core Login Logic (Single Source of Truth)
     * =====================================================
     */
    async _login(userId, ctx, isNewUser = false) {
        const { ip, deviceId, userAgent, familyId, } = ctx;
        if (!familyId) {
            throw new Error("FAMILY_ID_REQUIRED");
        }
        // 1️⃣ Risk log
        await this.loginRiskService.record({
            type: "LOGIN",
            userId,
            ip,
            deviceId,
            userAgent,
            familyId,
            severity: "LOW",
        });
        // 2️⃣ Issue tokens
        const tokens = await this.tokenService.issueTokens({
            userId,
            familyId,
            ip,
            deviceId,
            userAgent,
        });
        // 3️⃣ Persist refresh token
        await this.refreshTokenRepo.save(tokens.refreshToken, {
            userId,
            familyId,
            ip,
            deviceId,
            userAgent,
            issuedAt: new Date(),
        });
        // auth.service.js (_login)
        await this.sessionRepo.create({
            userId,
            familyId,
            deviceId,
            userAgent,
            ip,
            refreshTokenId: tokens.refreshJti,
            lastSeenAt: new Date(),
        });
        return {
            userId,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            familyId,
            isNewUser,
        };
    }
    /**
     * =====================================================
     * 🔗 Bind OAuth Provider
     * =====================================================
     */
    async bindOAuthAccount(provider, idToken, ctx) {
        console.log("App token:", idToken);
        const { userId, ip, deviceId } = ctx;
        if (!userId) {
            throw new Error("UNAUTHORIZED");
        }
        const oauth = await this.oauthService.verifyIdToken(provider, idToken);
        const { sub: providerUserId, email, emailVerified, } = oauth;
        if (!providerUserId) {
            throw new Error("INVALID_OAUTH_TOKEN");
        }
        if (email && !emailVerified) {
            throw new Error("OAUTH_EMAIL_NOT_VERIFIED");
        }
        const existing = await this.credentialRepo.findByProviderSub({
            provider,
            providerSub: providerUserId,
        });
        if (existing && existing.userId !== userId) {
            throw new Error("OAUTH_ALREADY_BOUND");
        }
        if (!existing) {
            await this.credentialRepo.create({
                userId,
                provider,
                providerSub: providerUserId,
                email,
                source: "USER_BIND",
            });
        }
        await this.loginRiskService.record({
            type: "BIND_OAUTH",
            userId,
            provider,
            ip,
            deviceId,
            severity: "LOW",
        });
        return true;
    }
    /**
     * =====================================================
     * ❌ Unbind OAuth Provider
     * =====================================================
     */
    async unbindOAuthAccount(provider, ctx) {
        const { userId, ip, deviceId } = ctx;
        if (!userId) {
            throw new Error("UNAUTHORIZED");
        }
        const credentials = await this.credentialRepo.findByUserId(userId);
        if (credentials.length <= 1) {
            throw new Error("CANNOT_UNBIND_LAST_PROVIDER");
        }
        const target = credentials.find((c) => c.provider === provider);
        if (!target) {
            throw new Error("OAUTH_NOT_BOUND");
        }
        await this.credentialRepo.deleteById(target.id);
        await this.loginRiskService.record({
            type: "UNBIND_OAUTH",
            userId,
            provider,
            ip,
            deviceId,
            severity: "LOW",
        });
        return true;
    }
}
