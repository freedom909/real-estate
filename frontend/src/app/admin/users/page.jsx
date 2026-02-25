"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users));
  }, []);

  const perform = async (mutation, userId) => {
    await fetch("/api/admin/mutate", {
      method: "POST",
      body: JSON.stringify({ mutation, userId })
    });

    // refresh
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin User Management</h1>

      <table className="border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th>Email</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Locked</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b">
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isVerified ? "✔️" : "❌"}</td>
              <td>{u.isLocked ? "🔒" : "🟢"}</td>

              <td className="space-x-2">
                <button
                  className="bg-green-600 text-white px-2 rounded"
                  onClick={() => perform("FORCE_VERIFY", u.id)}
                >
                  Verify
                </button>

                {!u.isLocked ? (
                  <button
                    className="bg-red-600 text-white px-2 rounded"
                    onClick={() => perform("LOCK", u.id)}
                  >
                    Lock
                  </button>
                ) : (
                  <button
                    className="bg-yellow-500 text-white px-2 rounded"
                    onClick={() => perform("UNLOCK", u.id)}
                  >
                    Unlock
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
