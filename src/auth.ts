// auth.ts (The Single Source of Truth)

import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authorizeCredentials } from "@/lib/auth/authorize-credentials";

// ประกาศประเภทข้อมูลเพิ่มเติมสำหรับ session และ token
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      studentId?: string | null;
      organizationId?: number | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    studentId?: string | null;
    organizationId?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: string;
    studentId?: string | null;
    organizationId?: number | null;
  }
}

// เราจะรวม Config ทั้งหมดไว้ที่นี่
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "อีเมลหรือ Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeCredentials(credentials ?? {}, {
          findAdminByUsername: (username) =>
            prisma.user.findFirst({
              where: { username, role: "ADMIN" },
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
                password: true,
                role: true,
                studentId: true,
                organizationId: true,
              },
            }),
          findNonAdminByEmail: (email) =>
            prisma.user.findFirst({
              where: { email, role: { in: ["USER", "ORG_ADMIN"] } },
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
                password: true,
                role: true,
                studentId: true,
                organizationId: true,
              },
            }),
          comparePassword: bcrypt.compare,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // เพิ่มข้อมูลเข้า token เมื่อมีการ login (user มีค่า)
      if (user) {
        token.sub = user.id; // เพิ่ม user id ลงใน token (sub คือ standard field สำหรับ subject)
        token.role = (user as { role?: string })?.role;
        token.studentId = (user as { studentId?: string | null })?.studentId;
        token.organizationId = (user as { organizationId?: number | null })?.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      // ดึงข้อมูลจาก token มาใส่ใน session
      if (token && session.user) {
        session.user.id = token.sub; // ดึง id จาก token (token.sub คือ user id)
        session.user.role = token.role as string; // ดึง role จาก token
        session.user.studentId = token.studentId as string | null;
        session.user.organizationId = token.organizationId as number | null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Export auth function สำหรับใช้ตรวจสอบ session
export async function auth() {
  const { getServerSession } = await import("next-auth/next");
  return getServerSession(authOptions);
}
