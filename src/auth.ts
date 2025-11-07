// auth.ts (The Single Source of Truth)

import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ประกาศประเภทข้อมูลเพิ่มเติมสำหรับ session และ token
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      studentId?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    studentId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: string;
    studentId?: string | null;
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
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
    async jwt({ token, user }) {
      // เพิ่มข้อมูลเข้า token เมื่อมีการ login (user มีค่า)
      if (user) {
        token.sub = user.id; // เพิ่ม user id ลงใน token (sub คือ standard field สำหรับ subject)
        token.role = (user as { role?: string })?.role;
        token.studentId = (user as { studentId?: string | null })?.studentId;
        // เพิ่ม role ลงใน token
      }
      return token;
    },
    async session({ session, token }) {
      // ดึงข้อมูลจาก token มาใส่ใน session
      if (token && session.user) {
        session.user.id = token.sub; // ดึง id จาก token (token.sub คือ user id)
        session.user.role = token.role as string; // ดึง role จาก token
        session.user.studentId = token.studentId as string | null;
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
