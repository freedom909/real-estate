// src/lib/adminApi.js
const BASE_URL = "/api/admin";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export default {
  // GET /api/admin/users
  getUsers() {
    return request("/users");
  },

  // GET /api/admin/users/:id
  getUser(id) {
    return request(`/users/${id}`);
  },

  // POST /api/admin/users/:id/verify
  verifyUser(id) {
    return request(`/users/${id}/verify`, { method: "POST" });
  },

  // POST /api/admin/users/:id/reject
  rejectUser(id) {
    return request(`/users/${id}/reject`, { method: "POST" });
  }
};
