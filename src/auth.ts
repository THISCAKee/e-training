// auth.ts (The Single Source of Truth)

import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  authorizeCredentials,
  toAuthorizedUser,
} from "@/lib/auth/authorize-credentials";
import {
  MSU_DOMAIN,
  fetchWorkspaceDepartment,
  findMsuAccount,
  signInWithMsuGoogle,
  type GoogleIdentity,
  type MsuAccountLookup,
} from "@/lib/auth/msu-google";

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
      needsFaculty?: boolean;
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
    needsFaculty?: boolean;
  }
}

const msuUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  studentId: true,
  faculty: true,
  organizationId: true,
} as const;

const msuAccountLookup: MsuAccountLookup = {
  findUserByEmail: (email) =>
    prisma.user.findUnique({ where: { email }, select: msuUserSelect }),
  findUserByStudentId: (studentId) =>
    prisma.user.findUnique({ where: { studentId }, select: msuUserSelect }),
};

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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: { params: { hd: MSU_DOMAIN, prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const accessToken = account.access_token;
      const result = await signInWithMsuGoogle(profile as GoogleIdentity, {
        ...msuAccountLookup,
        fetchDepartment: async () =>
          accessToken ? fetchWorkspaceDepartment(accessToken) : null,
        createUser: (data) =>
          prisma.user.create({
            data: { ...data, role: "USER" },
            select: msuUserSelect,
          }),
        updateUser: (id, data) =>
          prisma.user.update({ where: { id }, data, select: msuUserSelect }),
      });

      return result.ok || `/login?error=${result.error}`;
    },
    async jwt({ token, user, account, trigger }) {
      // Google ส่ง user เป็นโปรไฟล์ของ Google จึงต้องดึง user ในระบบที่ signIn สร้างหรือจับคู่ไว้
      if (account?.provider === "google" && token.email) {
        const msuUser = await findMsuAccount(token.email, msuAccountLookup);
        if (!msuUser) throw new Error("MSU Google user missing after signIn");
        user = toAuthorizedUser(msuUser);
        // บัญชีที่จับคู่ด้วยรหัสนิสิตอาจใช้อีเมลอื่น ให้ session ใช้อีเมลของบัญชีในระบบ
        token.email = msuUser.email;
        // ผู้ใช้ Google ที่ยังไม่มีคณะต้องเลือกคณะ/หน่วยงานก่อนใช้งาน
        token.needsFaculty = !msuUser.faculty;
      }
      // หน้าเลือกคณะเรียก update() หลังบันทึก จึงอ่านค่าจากฐานข้อมูลอีกครั้ง
      if (trigger === "update" && token.needsFaculty) {
        const current = await prisma.user.findUnique({
          where: { id: Number(token.sub) },
          select: { faculty: true },
        });
        token.needsFaculty = !current?.faculty;
      }
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
        session.user.needsFaculty = token.needsFaculty ?? false;
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
