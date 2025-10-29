// src/app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Import auth จากไฟล์หลักของเรา

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // 1. ตรวจสอบ Session และสิทธิ์การเข้าถึง
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    // ถ้าไม่ใช่ Admin หรือไม่ได้ Login ให้ส่ง Error กลับไป
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    // 2. ดึงข้อมูลผู้ใช้ทั้งหมดจากฐานข้อมูล
    const users = await prisma.user.findMany({
      // 3. เลือกเฉพาะ field ที่ต้องการส่งกลับไป (เพื่อความปลอดภัย)
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc", // เรียงจากผู้ใช้ล่าสุดก่อน
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
