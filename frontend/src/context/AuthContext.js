"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 初始化：从 localStorage 恢复登录态
   * （现在是 debug 阶段，后面可以换成 /me）
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth:user");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Restore auth failed:", err);
      localStorage.removeItem("auth:user");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 登录成功后调用
   */
  const login = (user) => {
    setUser(user);
    localStorage.setItem("auth:user", JSON.stringify(user));
  };

  /**
   * 登出
   */
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("auth:user");

    // 如果你用 NextAuth
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
