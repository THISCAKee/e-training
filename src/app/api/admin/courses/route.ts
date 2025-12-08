/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/admin/courses/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";
// ฟังก์ชันนี้จะดึงข้อมูลหลักสูตรทั้งหมด
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;

    const whereCondition = search
      ? {
          title: { contains: search },
        }
      : {};

    const [courses, totalCount] = await prisma.$transaction([
      prisma.course.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { lessons: true } },
          category: { select: { name: true } }, // (เพิ่ม) นับจำนวนบทเรียน
          enrollments: {
            select: { status: true},
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
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, imageUrl, categoryId } = body;

    if (!title || !description) {
      return new NextResponse("Title and description are required", {
        status: 400,
      });
    }

    // Only include fields that exist on the Prisma Course model
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
    });

    return NextResponse.json(newCourse, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("CREATE_COURSE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
// ฟังก์ชันนี้จะสร้างหลักสูตรใหม่
