// src/app/api/courses/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // (Import prisma client ของคุณ)

export const dynamic = "force-dynamic"; // (แนะนำ) เพื่อให้ข้อมูลอัปเดตเสมอ

export async function GET(request: Request) {
  try {
    // ดึงข้อมูล Course ทั้งหมด
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc", // เรียงตามล่าสุด
      },
      // (Optional) อาจจะ include จำนวนบทเรียนมาด้วย ถ้าต้องการแสดงใน Card
      include: {
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("GET_PUBLIC_COURSES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
