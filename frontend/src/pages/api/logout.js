// src/pages/api/logout.js
import { serialize } from "cookie";

export default async function handler(req, res) {
  const cookie = serialize("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: -1, // Expire the cookie
  });

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ message: "Logged out" });
}
