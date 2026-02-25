import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "OAuthLogin",

      credentials: {
        provider: { type: "text" },
        idToken: { type: "text" },
      },

      async authorize(credentials) {
        console.log("🟢 authorize called with:", credentials);

        try {
          const res = await fetch(
            process.env.AUTH_GRAPHQL_ENDPOINT,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `
                  mutation OAuthLogin($input: OAuthLoginInput!) {
                    oauthLogin(input: $input) {
                      accessToken
                      user {
                        id
                        email
                        role
                      }
                    }
                  }
                `,
                variables: {
                  input: {
                    provider: credentials.provider,
                    payload: {
                      idToken: credentials.idToken,
                    },
                  },
                },
              }),
            }
          );

          if (!res.ok) {
            console.error("❌ GraphQL HTTP error:", res.status);
            return null;
          }

          const json = await res.json();
          console.log("🟢 GraphQL response:", json);

          const result = json?.data?.oauthLogin;
          if (!result?.user) {
            console.error("❌ No user returned from backend");
            return null;
          }

          // ✅ 关键：必须 return 一个 user 对象
          return {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            accessToken: result.accessToken,
          };
        } catch (err) {
          console.error("❌ authorize fetch failed:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    error: "/login",
  },

  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
