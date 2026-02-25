// app/api/admin/users/[id]/verify/route.js

const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || "http://localhost:5005";

export async function POST(req, { params }) {
  const { id } = params;

  try {
    const res = await fetch(`${ADMIN_SERVICE_URL}/admin/users/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Failed to verify user", details: error.message },
      { status: 500 }
    );
  }
}
