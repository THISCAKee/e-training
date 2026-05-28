// src/app/api/public/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count({
      where: {
        role: "USER",
      },
    });
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.userCourseEnrollment.count();

    // ดึงข้อมูลการลงทะเบียนทั้งหมดเพื่อนำมาแยกตามหมวดหมู่
    const enrollments = await prisma.userCourseEnrollment.findMany({
      include: {
        course: {
          include: {
            category: true,
          },
        },
      },
    });

    const categoryMap: Record<string, number> = {};
    enrollments.forEach((enrollment) => {
      const categoryName = enrollment.course?.category?.name || "ไม่มีหมวดหมู่";
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
    });

    // ดึงข้อมูลผู้ใช้เพื่อนำมาคำนวณสถิติตามคณะ (สังกัด)
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        faculty: true,
      },
    });

    const facultyMap: Record<string, number> = {};
    users.forEach((user) => {
      const facultyName = user.faculty || "ไม่ระบุคณะ";
      facultyMap[facultyName] = (facultyMap[facultyName] || 0) + 1;
    });

    // แปลงข้อมูลให้อยู่ในรูปแบบ Array และเรียงลำดับจากมากไปน้อย
    const categoryStats = Object.keys(categoryMap)
      .map((name) => ({
        name,
        count: categoryMap[name],
      }))
      .sort((a, b) => b.count - a.count);

    const facultyStats = Object.keys(facultyMap)
      .map((name) => ({
        name,
        count: facultyMap[name],
      }))
      .sort((a, b) => b.count - a.count);

    const courseEnrollmentStats = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
    });

    return NextResponse.json(
      {
        userCount,
        courseCount,
        enrollmentCount,
        categoryStats,
        facultyStats,
        courseEnrollmentStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET_PUBLIC_STATS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
