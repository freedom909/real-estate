// src/gateway/plugins/authCookiePlugin.ts
import crypto from "crypto";
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { BaseContext } from '@apollo/server';
import type { GraphQLResponse } from '@apollo/server';

interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'none' | 'lax' | 'strict';
  secure: boolean;
  path: string;
  maxAge?: number;
}

interface OAuthLoginData {
  accessToken?: string;
  refreshToken?: string;
}

interface RefreshTokenData {
  accessToken?: string;
}

interface LogoutData {
  logout?: boolean;
}

interface RevokeTokenData {
  revokeToken?: boolean;
}

interface ResponseData {
  oauthLogin?: OAuthLoginData;
  refreshToken?: RefreshTokenData;
  logout?: boolean;
  revokeToken?: RevokeTokenData;
}

interface CustomContext extends BaseContext {
  res?: {
    cookie: (name: string, value: string, options: CookieOptions) => void;
    clearCookie: (name: string, options?: any) => void; // Changed to any to allow partial options
  };
}

export function authCookiePlugin(): ApolloServerPlugin {
  return {
    async requestDidStart(): Promise<GraphQLRequestListener<CustomContext>> {
      return {
        async willSendResponse({ contextValue, response }) {
          const { res } = contextValue;
          if (!res) return;

          // Handle both regular and incremental response bodies
          let responseData: ResponseData | undefined;
          
          if ('singleResult' in response.body) {
            // Regular response
            responseData = response.body.singleResult?.data;
          } else if ('initialResult' in response.body) {
            // Incremental response - only handle initial result
            responseData = (response.body as any).initialResult?.data;
          } else {
            // Fallback for other response types
            responseData = (response.body as any).data;
          }

          if (!responseData) return;

          const payload =
            responseData.oauthLogin ||
            responseData.refreshToken ||
            responseData.logout ||
            responseData.revokeToken;

          if (!payload) return;

          /** ===== LOGOUT / REVOKE ===== */
          if (payload === true) {
            res.clearCookie("accessToken"); // Removed options object
            res.clearCookie("refreshToken"); // Removed options object
            res.clearCookie("csrf_token"); // Removed options object
            return;
          }

          /** ===== LOGIN / REFRESH ===== */
          const { accessToken, refreshToken } = payload as OAuthLoginData;

          if (accessToken) {
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              sameSite: "none", // ✅ Required for Apollo Studio (Cross-Site)
              secure: true,     // ✅ Required when SameSite is none
              path: "/",
              maxAge: 2 * 60 * 60 * 1000,
            });
          }

          if (refreshToken) {
            res.cookie("refreshToken", refreshToken, {
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