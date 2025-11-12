// proxy.ts (Middleware for Next.js)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get token from request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  // กฎข้อที่ 1: ถ้าเป็น ADMIN และกำลังจะไปที่ /dashboard ให้ส่งไป /admin แทน
  if (userRole === "ADMIN" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // กฎข้อที่ 2: ป้องกันหน้า Admin - ต้องเป็น ADMIN เท่านั้น
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // กฎข้อที่ 3: ป้องกันหน้า Dashboard ทั่วไป - ต้อง login
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
