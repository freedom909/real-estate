"use client";

import { useSession, signOut, SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}

function HomeContent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h1>✅ Logged in</h1>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>

      <button onClick={() => signOut({ callbackUrl: "/login" })}>
        Logout
      </button>
    </div>
  );
}
