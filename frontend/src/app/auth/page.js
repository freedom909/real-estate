"use client";
//app/auth/page.js
import { useEffect, useState ,useCallback} from "react";
import { getSession,useSession, signIn } from "next-auth/react";
import Head from "next/head";
import dayjs from "dayjs";
import OAuthService from "@/userService/oauthService";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Auth() {
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState(null);
    const { data: session } = useSession();

    const fallbackGoogleLogin = async () => {
        try {
            const res = await signIn("google", { callbackUrl: "/dashboard" });
            console.log("🔍 account =", account);
            console.log("🔍 id_token =", account?.id_token);
            console.log("🔍 profile =", profile);
            if (!res?.ok) {
                setError("Google fallback login failed.");
            }
        } catch (err) {
            console.error("Fallback Google login error:", err);
            setError("An unexpected error occurred.");
        }
    };

    const handleGoogleCredentialResponse = useCallback(async (response) => {
        const token = response.credential;
        console.log('🔑 Received Google credential token:', token);
        try {
            console.log('📡 Sending Google token to backend...');// I did not find output in the terminal
            const result = await OAuthService.oauthLoginWithIdToken({ provider: "google", idToken: token });
            console.log('📬 Backend response:', result);

            if (result.accessToken) {
                localStorage.setItem("username", result.user.name);
                console.log("🌐 Frontend session:", session);
                window.location.href = "/dashboard";
            } else {
                console.warn("OAuthService login failed, falling back to NextAuth.");
                fallbackGoogleLogin();
            }
        } catch (err) {
            console.error("OAuthService error:", err);
            fallbackGoogleLogin();
        }
    }, [session]);

    useEffect(() => {
        setIsClient(true);

        if (window.google && googleClientId) {
            try {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCredentialResponse,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("google-login-button"),
                    { theme: "outline", size: "large" }
                );
                window.google.accounts.id.prompt();
            } catch (e) {
                console.warn("Google Identity Services failed to initialize. Fallback will be used.");
            }
        }
    }, [handleGoogleCredentialResponse]);

    const handleAppleLogin = async () => {
        try {
            await signIn("apple", { callbackUrl: "/dashboard" });
        } catch (err) {
            console.error("Apple login error:", err);
            setError("Apple login failed.");
        }
    };

    if (!isClient) return null;

    return (
        <>
            <Head>
                <script
                    src="https://accounts.google.com/gsi/client"
                    async
                    defer
                ></script>
            </Head>

            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-xl font-bold mb-4">OAuth Login</h1>

                {/* Google Login (GIS first, fallback available) */}
                <div id="googleSignInDiv" className="mb-4"></div>

                {/* Fallback Google Login Button */}
                <button
                    onClick={fallbackGoogleLogin}
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                >
                    Sign in with Google (Fallback)
                </button>
                <GoogleSignInButton useGIS={true} />
                {/* Apple Login */}
                <button
                    onClick={handleAppleLogin}
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    Sign in with Apple
                </button>

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </>
    );
}