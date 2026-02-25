// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string'; // Use a strong secret in production
export const config = {
    matcher: ["/dashboard", "/account", "/settings"], // Adjust to your protected routes
  };
  
// Define protected paths
const protectedRoutes = ["/dashboard", "/account", "/settings"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only apply to protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return NextResponse.next(); // Valid token, allow request
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next(); // Allow public routes
}
