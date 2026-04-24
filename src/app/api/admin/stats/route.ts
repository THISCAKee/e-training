// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const lessonCount = await prisma.lesson.count();
    const enrollmentCount = await prisma.userCourseEnrollment.count({
      where: { status: "IN_PROGRESS" },
    });

    // ดึงข้อมูลการลงทะเบียนทั้งหมดพร้อมข้อมูลหมวดหมู่ของคอร์ส
    const enrollments = await prisma.userCourseEnrollment.findMany({
      include: {
        course: {
          include: {
            category: true,
          },
        },
      },
    });

    // คำนวณสถิติแยกตามหมวดหมู่
    const categoryMap: Record<string, number> = {};
    enrollments.forEach((enrollment) => {
      const categoryName = enrollment.course?.category?.name || "ไม่มีหมวดหมู่";
      if (categoryMap[categoryName]) {
        categoryMap[categoryName]++;
      } else {
        categoryMap[categoryName] = 1;
      }
    });

    // แปลง object เป็น array สำหรับใช้ทำกราฟ และเรียงจากมากไปน้อย
    const categoryStats = Object.keys(categoryMap).map((name) => ({
      name,
      count: categoryMap[name],
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json(
      {
        userCount,
        courseCount,
        lessonCount,
        enrollmentCount,
        categoryStats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_STATS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
