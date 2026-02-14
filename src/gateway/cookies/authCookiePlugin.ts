import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { BaseContext } from '@apollo/server';
import type { GraphQLResponse } from '@apollo/server';

interface OAuthLoginData {
  accessToken?: string;
  refreshToken?: string;
}

interface RefreshTokenData {
  accessToken?: string;
}

interface ResponseData {
  oauthLogin?: OAuthLoginData;
  refreshToken?: RefreshTokenData;
  logout?: boolean;
  revokeToken?: boolean;
}

interface CustomContext extends BaseContext {
  res?: {
    cookie: (name: string, value: string, options: any) => void;
    clearCookie: (name: string) => void;
  };
}

export function authCookiePlugin(): ApolloServerPlugin {
  return {
    async requestDidStart(): Promise<GraphQLRequestListener<CustomContext>> {
      return {
        async willSendResponse({ contextValue, response }) {
          const res = contextValue.res;
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

          /** ===== LOGIN ===== */
          if (responseData.oauthLogin) {
            const { accessToken, refreshToken } = responseData.oauthLogin;

            if (accessToken) {
              res.cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
              });
            }

            if (refreshToken) {
              res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                sameSite: "strict" as const,
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
                sameSite: "lax" as const,
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