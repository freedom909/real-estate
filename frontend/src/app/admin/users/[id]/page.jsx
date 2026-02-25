"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function UserDetailPage({ params }) {
  const { id: userId } = params;

  const [user, setUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user detail + audit logs
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        setUser(data.user);
        setAuditLogs(data.auditLogs);
      } catch (err) {
        console.error("Failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-bold">User Details</h1>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <img
              src={user.picture || "/default-avatar.png"}
              className="w-24 h-24 rounded-full border"
              alt="Avatar"
            />
            <div>
              <p className="text-xl font-semibold">{user.fullName}</p>
              <p className="text-gray-600">{user.email}</p>
              <Badge className="mt-2">{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MyNumber Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">Status:</p>
          <Badge
            variant={
              user.kycStatus === "VERIFIED" ? "success" : "secondary"
            }
          >
            {user.kycStatus || "NOT_SUBMITTED"}
          </Badge>

          {user.kycStatus === "PENDING" && (
            <div className="mt-4">
              <Button
                onClick={() => verifyUser(userId)}
                className="mr-2"
              >
                Approve Manually
              </Button>

              <Button
                variant="destructive"
                onClick={() => rejectUser(userId)}
              >
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 && <p>No logs found.</p>}

          <ul className="space-y-4">
            {auditLogs.map((log) => (
              <li
                key={log.id}
                className="p-3 bg-gray-100 rounded-lg border"
              >
                <p className="text-sm text-gray-700">{log.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


// -------------------------------------------
// Admin Actions
// -------------------------------------------

async function verifyUser(userId) {
  await fetch(`/api/admin/users/${userId}/verify`, { method: "POST" });
  alert("User verified!");
  location.reload();
}

async function rejectUser(userId) {
  await fetch(`/api/admin/users/${userId}/reject`, { method: "POST" });
  alert("User rejected.");
  location.reload();
}
