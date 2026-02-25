"use client";

import React from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    // 1. Clear any local storage data that might persist across sessions.
    // This is crucial for preventing stale data from being displayed.
    localStorage.clear();

    // 2. Call next-auth's signOut function.
    // This will clear the session cookie and update the session state.
    // It redirects to the homepage after signing out.
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
