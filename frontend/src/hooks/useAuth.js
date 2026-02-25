// frontend/src/hooks/useAuth.js
"use client";
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    loading: status === "loading",
    isAuthenticated: !!session?.user,
    user: session?.user || null,
    role: session?.user?.role || null,
  };
}
