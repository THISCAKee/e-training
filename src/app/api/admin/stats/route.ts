// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const isOrgAdmin = session.user.role === "ORG_ADMIN";
  const orgId = session.user.organizationId;

  if (isOrgAdmin && !orgId) {
    return new NextResponse("Organization not found", { status: 400 });
  }

  try {
    const userWhere = isOrgAdmin ? { organizationId: orgId } : {};
    const courseWhere = isOrgAdmin ? { organizationId: orgId } : {};
    const enrollmentWhere = isOrgAdmin 
      ? { status: "IN_PROGRESS" as const, course: { organizationId: orgId } }
      : { status: "IN_PROGRESS" as const };

    const userCount = await prisma.user.count({ where: userWhere });
    const courseCount = await prisma.course.count({ where: courseWhere });
    
    // For lessons, we count lessons that belong to courses of the organization
    const lessonCount = await prisma.lesson.count({
      where: isOrgAdmin ? { course: { organizationId: orgId } } : {}
    });
    
    const enrollmentCount = await prisma.userCourseEnrollment.count({
      where: enrollmentWhere,
    });

    // ดึงข้อมูลการลงทะเบียนทั้งหมดพร้อมข้อมูลหมวดหมู่ของคอร์ส และข้อมูลผู้ใช้
    const enrollments = await prisma.userCourseEnrollment.findMany({
      where: isOrgAdmin ? { course: { organizationId: orgId } } : {},
      include: {
        course: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            faculty: true,
          },
        },
      },
    });

    // คำนวณสถิติแยกตามหมวดหมู่
    const categoryMap: Record<string, number> = {};

    enrollments.forEach((enrollment) => {
      // หมวดหมู่
      const categoryName = enrollment.course?.category?.name || "ไม่มีหมวดหมู่";
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
    });

    // ดึงผู้ใช้ทั้งหมดที่ไม่ใช่ ADMIN และ ORG_ADMIN เพื่อคำนวณ facultyStats
    const usersForFaculty = await prisma.user.findMany({
      where: {
        ...(isOrgAdmin ? { organizationId: orgId } : {}),
        role: {
          notIn: ["ADMIN", "ORG_ADMIN"]
        }
      },
      select: {
        faculty: true
      }
    });

    const facultyMap: Record<string, number> = {};
    usersForFaculty.forEach((user) => {
      const facultyName = user.faculty || "ไม่ระบุคณะ";
      facultyMap[facultyName] = (facultyMap[facultyName] || 0) + 1;
    });

    // แปลง object เป็น array และเรียงจากมากไปน้อย
    const categoryStats = Object.keys(categoryMap).map((name) => ({
      name,
      count: categoryMap[name],
    })).sort((a, b) => b.count - a.count);

    const facultyStats = Object.keys(facultyMap).map((name) => ({
      name,
      count: facultyMap[name],
    })).sort((a, b) => b.count - a.count);

    const courseEnrollmentStats = await prisma.course.findMany({
      where: courseWhere,
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
        lessonCount,
        enrollmentCount,
        categoryStats,
        facultyStats,
        courseEnrollmentStats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_STATS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
