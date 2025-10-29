// middleware.ts (ฉบับแก้ไข)

export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
