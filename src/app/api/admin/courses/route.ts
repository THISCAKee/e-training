// src/app/api/admin/courses/route.ts

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
// ฟังก์ชันนี้จะดึงข้อมูลหลักสูตรทั้งหมด
export async function GET(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;

    // ORG_ADMIN: ดูได้เฉพาะคอร์สของหน่วยงานตัวเอง
    // ADMIN: ดูได้ทั้งหมด
    const orgFilter =
      session?.user?.role === "ORG_ADMIN" && session.user.organizationId
        ? { organizationId: session.user.organizationId }
        : {};

    const whereCondition = {
      ...(search ? { title: { contains: search } } : {}),
      ...orgFilter,
    };

    const [courses, totalCount] = await prisma.$transaction([
      prisma.course.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { lessons: true } },
          category: { select: { name: true } },
          organization: { select: { id: true, name: true } },
          enrollments: {
            select: {
              status: true,
              enrolledAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        skip: skip,
        take: pageSize,
      }),
      prisma.course.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json(
      {
        data: courses,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_COURSES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
// === เพิ่มฟังก์ชัน POST สำหรับสร้าง Course ใหม่ ===
export async function POST(request: Request) {
  const session = await auth();
  // อนุญาตให้ ADMIN และ ORG_ADMIN สร้างคอร์สได้
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      categoryId,
      skillDataResearch,
      skillDataAnalysis,
      skillAcademicCommunication,
      skillEnglishProficiency,
      skillDataPrivacy,
    } = body;

    if (!title || !description) {
      return new NextResponse("Title and description are required", {
        status: 400,
      });
    }

    // ORG_ADMIN: ผูกคอร์สกับหน่วยงานของตัวเองอัตโนมัติ
    // ADMIN: สามารถเลือกหน่วยงานได้ หรือไม่ผูกก็ได้
    const organizationId =
      session.user.role === "ORG_ADMIN"
        ? session.user.organizationId
        : body.organizationId
          ? parseInt(body.organizationId)
          : null;

    const data: Prisma.CourseUncheckedCreateInput = {
      title,
      description,
      imageUrl,
      categoryId: categoryId ? parseInt(categoryId) : null,
      organizationId,
      skillDataResearch: !!skillDataResearch,
      skillDataAnalysis: !!skillDataAnalysis,
      skillAcademicCommunication: !!skillAcademicCommunication,
      skillEnglishProficiency: !!skillEnglishProficiency,
      skillDataPrivacy: !!skillDataPrivacy,
    };

    const newCourse = await prisma.course.create({ data });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("CREATE_COURSE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
