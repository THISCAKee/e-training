// auth.ts (The Single Source of Truth)

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// เราจะรวม Config ทั้งหมดไว้ที่นี่
const authOptions: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password) return null;

        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (isPasswordMatch) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, id: String(user.id) };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    // ---- START OF AUTHORIZED CALLBACK ----
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as { role?: string })?.role;
      const pathname = nextUrl.pathname;

      // กฎข้อที่ 1: ถ้าเป็น ADMIN และกำลังจะไปที่ /dashboard ให้ส่งไป /admin แทน
      // นี่คือ Logic หลักสำหรับแก้ปัญหา Redirect
      if (userRole === "ADMIN" && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }

      // กฎข้อที่ 2: ป้องกันหน้า Admin
      if (pathname.startsWith("/admin")) {
        return userRole === "ADMIN"; // ต้องเป็น Admin เท่านั้น
      }

      // กฎข้อที่ 3: ป้องกันหน้า Dashboard ทั่วไป
      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn; // ขอแค่ Login ก็พอ
      }

      return true; // สำหรับหน้าอื่นๆ ที่เป็น Public
    },
    // ---- END OF AUTHORIZED CALLBACK ----

    async jwt({ token, user }) {
      // เพิ่มข้อมูลเข้า token เมื่อมีการ login (user มีค่า)
      if (user) {
        token.sub = user.id; // เพิ่ม user id ลงใน token (sub คือ standard field สำหรับ subject)
        token.role = (user as { role?: string })?.role;
        // เพิ่ม role ลงใน token
      }
      return token;
    },
    async session({ session, token }) {
      // ดึงข้อมูลจาก token มาใส่ใน session
      if (token && session.user) {
        session.user.id = token.sub; // ดึง id จาก token (token.sub คือ user id)
        session.user.role = token.role as string; // ดึง role จาก token
      }
      return session;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
