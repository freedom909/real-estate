// src/subgraphs/auth/services/token/token.service.ts
import jwt from "jsonwebtoken";
import fs from "fs";
import { randomUUID } from "crypto";
const PRIVATE_KEY_PATH = process.env.JWT_PRIVATE_KEY_PATH;
const PUBLIC_KEY_PATH = process.env.JWT_PUBLIC_KEY_PATH;
let PRIVATE_KEY;
let PUBLIC_KEY;
try {
    PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
    PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
    console.log("AUTH using private key:", PRIVATE_KEY_PATH);
    console.log("AUTH using public key:", PUBLIC_KEY_PATH);
}
catch (error) {
    console.error("Failed to load JWT keys:", error.message);
    throw new Error("JWT key files are required but could not be loaded");
}
export default class TokenService {
    constructor() {
        this.refreshExpiresIn = "7d";
        this.issuer = process.env.JWT_ISSUER || "auth-service";
        this.algorithm = "RS256";
        this.accessExpiresIn =
            process.env.JWT_ACCESS_EXPIRES_IN || "15m";
        this.refreshExpiresIn =
            (process.env.JWT_REFRESH_EXPIRES_IN || "30d");
    }
    generateAccessToken({ userId, role, email }) {
        const options = {
            algorithm: this.algorithm,
            issuer: this.issuer,
            expiresIn: (this.accessExpiresIn || "15m"),
        };
        return jwt.sign({
            sub: userId,
            role,
            email,
        }, PRIVATE_KEY, options);
    }
    // Alias for compatibility with RefreshTokenService
    signAccessToken(payload) {
        const options = {
            algorithm: this.algorithm,
            issuer: this.issuer,
            expiresIn: (this.accessExpiresIn || "15m"),
        };
        return jwt.sign({
            ...payload,
            type: "access",
        }, PRIVATE_KEY, options);
    }
    // Alias for compatibility with RefreshTokenService
    signRefreshToken(payload) {
        const jti = randomUUID();
        const token = jwt.sign({
            ...payload,
            type: "refresh",
        }, PRIVATE_KEY, {
            algorithm: this.algorithm,
            issuer: this.issuer,
            expiresIn: this.refreshExpiresIn,
            jwtid: jti,
        });
        return { token, jti };
    }
    get accessTokenTTL() {
        return process.env.ACCESS_TOKEN_TTL || "15m";
    }
    generateRefreshToken({ userId }) {
        const options = {
            algorithm: this.algorithm,
            issuer: this.issuer,
            expiresIn: this.refreshExpiresIn,
        };
        return jwt.sign({
            sub: userId,
            type: "refresh",
        }, PRIVATE_KEY, options);
    }
    // ✅ 新增
    verifyRefreshToken(token) {
        let payload;
        try {
            const options = {
                algorithms: [this.algorithm],
                issuer: this.issuer,
            };
            console.log("issuer", this.issuer);
            payload = jwt.verify(token, PUBLIC_KEY, options);
        }
        catch (error) {
            throw new Error(`Refresh token verification failed: ${error.message}`);
        }
        if (typeof payload === 'string' || payload.type !== "refresh") {
            throw new Error("Invalid refresh token type");
        }
        // Map 'sub' to 'userId' so RefreshTokenService can use it
        return {
            ...payload,
            userId: payload.sub,
        };
    }
    // （可选，但强烈推荐）
    verifyAccessToken(token) {
        try {
            const options = {
                algorithms: [this.algorithm],
                issuer: this.issuer,
            };
            console.log("SIGNING issuer:", this.issuer);
            const decoded = jwt.verify(token, PUBLIC_KEY, options);
            return decoded;
        }
        catch (error) {
            throw new Error(`Access token verification failed: ${error.message}`);
        }
    }
    getRefreshTokenTTL() {
        const ttl = this.refreshExpiresIn;
        if (typeof ttl === "number")
            return ttl;
        if (typeof ttl === "string") {
            const match = ttl.match(/^(\d+)([dhms])$/);
            if (match) {
                const val = parseInt(match[1], 10);
                const unit = match[2];
                if (unit === "d")
                    return val * 24 * 60 * 60;
                if (unit === "h")
                    return val * 60 * 60;
                if (unit === "m")
                    return val * 60;
                if (unit === "s")
                    return val;
            }
        }
        return parseInt(ttl) || 30 * 24 * 60 * 60; // Default 30d
    }
    getAccessTokenTTL() {
        return process.env.ACCESS_TOKEN_TTL || "15m";
    }
    issueTokens({ userId, tokenVersion = 0, familyId, deviceId }) {
        const accessToken = this.signAccessToken({
            sub: userId,
            tokenVersion,
        });
        const { token: refreshToken, jti } = this.signRefreshToken({
            sub: userId,
            tokenVersion,
            familyId,
            deviceId,
        });
        return {
            accessToken,
            refreshToken,
            refreshJti: jti,
        };
    }
}
