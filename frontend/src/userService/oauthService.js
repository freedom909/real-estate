//frontend/ src/userService/oauthService.js
import config from '@/config/config.js'

// Define the GraphQL endpoint URL
const SUBGRAPH_USER_URL = `${config.API_URL}/graphql`;

class OAuthService {
    constructor() {
        this.token = null;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('jwt_token');
        }
    }
    async sendOAuthRequestToSubgraph(provider, token) {
        console.log("🔄 Sending request to subgraph...");

        try {
            const response = await fetch('http://localhost:4010/graphql', { //it did not use post
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                mutation SignIn($input: SignInInput!) {
                  signIn(input: $input) {
                    success
                    userId
                    role
                    code
                  }
                }
              `,
                    variables: {
                        input: {
                            provider: provider.toUpperCase(),
                            token,// pass empty input object if your backend extracts info from token
                        }
                    }
                })
            });

            if (!response.ok) throw new Error('Request failed');

            const data = await response.json();
            console.log('OAuth response:', data);

            if (!data.data?.signIn?.success) {
                throw new Error(data.errors?.[0]?.message || 'OAuth login failed');
            }

            return { success: true, data: data.data.signIn };
        } catch (err) {
            console.error('OAuth request failed:', err);
            return { success: false };
        }
    }

    // frontend/src/userService/oauthService.js

    // NextAuth callback
    async signIn({ account }) {
        const idToken = account.id_token;

        await fetch("http://auth-subgraph/graphql", {
            method: "POST",
            body: JSON.stringify({
                query: `
        mutation ($provider: String!, $idToken: String!) {
          oauthLoginWithIdToken(provider: $provider, idToken: $idToken) {
            accessToken
          }
        }
      `,
                variables: { idToken },
            }),
        });

        return true;
    }


    async oauthLoginWithIdToken({ provider, idToken }) {
        console.log("🔄 Sending ID token to auth subgraph...");

        const response = await fetch("http://localhost:4010/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // 🔐 接收 refreshToken cookie
            body: JSON.stringify({
                query: `
        mutation OAuthLoginWithIdToken($provider: String!, $idToken: String!) {
          oauthLoginWithIdToken(provider: $provider, idToken: $idToken) {
            accessToken
            user {
              email
              role
            }
          }
        }
      `,
                variables: { provider: provider, idToken },
            }),
        });

        const result = await response.json();

        // ✅ GraphQL 标准错误处理
        if (result.errors) {
            console.error("GraphQL errors:", result.errors);
            throw new Error(result.errors[0].message);
        }

        const { accessToken, user, refreshToken } = result.data.oauthLoginWithIdToken;
        response.cookie("rt", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        // ✅ accessToken 存前端
        localStorage.setItem("jwt_token", accessToken);
        this.token = accessToken;

        return { user, accessToken };
    }


    logout() {
        if (typeof window === 'undefined') return;

        // 清除本地存储的令牌
        localStorage.removeItem('jwt_token');
        this.token = null;

        // 可以在这里添加其他清理操作，如清除用户状态等
        console.log('User logged out');
    }

    /**
     * 注册新用户
     * @param {Object} userData - 用户注册数据
     * @returns {Promise<Object>} - 注册结果
     */
    async registerUser(userData) {
        try {
            // 如果没有提供头像，使用默认头像
            if (!userData.picture) {
                userData.picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;
            }

            const query = `
               mutation Mutation($input: SignUpInput!) {
  signUp(input: $input) {
    role
    userId
    code
    message
    refreshToken
    success
    auth {
      token
    }
  }
}
            `;

            const response = await fetch(SUBGRAPH_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        input: userData
                    }
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message);
            }

            const registerResult = result.data.register;

            if (!registerResult.success) {
                throw new Error(registerResult.message || '注册失败');
            }

            // 存储JWT令牌
            if (registerResult.token) {
                localStorage.setItem('jwt_token', registerResult.token);
                this.token = registerResult.token;
            }

            return {
                success: true,
                user: registerResult.user,
                token: registerResult.token,
                message: registerResult.message
            };
        } catch (error) {
            console.error('注册失败:', error);
            return {
                success: false,
                error: error.message || '注册过程中发生错误'
            };
        }
    }

    getToken() {
        return this.token;
    }
}

// ✅ create and export a singleton instance
const oauthService = new OAuthService();
export default oauthService;
