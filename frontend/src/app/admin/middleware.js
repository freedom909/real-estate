import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const token = req.cookies.get("admin_token")?.value;

  if (url.pathname.startsWith("/admin")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
