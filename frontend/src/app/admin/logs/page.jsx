"use client";

import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Audit Logs</h1>

      {logs.map(log => (
        <div key={log.id} className="border p-2 mb-2 rounded bg-gray-100">
          <div><strong>{log.type}</strong></div>
          <div>{log.message}</div>
          <div className="text-sm opacity-70">{log.createdAt}</div>
        </div>
      ))}
    </div>
  );
}
