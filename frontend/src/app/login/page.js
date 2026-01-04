"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import FacebookSignInButton from "@/components/FacebookSignInButton";
import GithubSignInButton from "@/components/GithubSignInButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/"
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError(err.message || "登录失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-xs bg-blue-600 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-white text-center">
          登录您的账户
        </h1>
        <p className="text-center text-sm text-blue-200 mb-4">
          或{' '}
          <Link href="/auth/register" className="text-white hover:text-blue-200 transition-colors">
            注册新账户
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full py-1.5 px-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
              placeholder="电子邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full py-1.5 px-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-800 hover:bg-blue-900'
            } transition-colors`}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-500"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-blue-600 text-blue-200">或使用以下方式登录</span>
          </div>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton />
          <FacebookSignInButton />
          <GithubSignInButton />
        </div>
      </div>
    </div>
  );
}