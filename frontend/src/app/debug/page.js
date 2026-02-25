"use client";
import { useSession } from "next-auth/react";
export default function DebugPage() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;
const { data: session, status } = useSession();
if (status === "loading") return <p>Loading...</p>;
if (!session) return <p>Not logged in</p>;
  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl mb-4">Debug Auth State</h1>

      {user ? (
        <pre className="bg-black p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      ) : (
        <p>No user found</p>
      )}
    </div>
  );
}
