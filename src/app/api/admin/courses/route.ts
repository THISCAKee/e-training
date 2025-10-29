/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/admin/courses/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// ฟังก์ชันนี้จะดึงข้อมูลหลักสูตรทั้งหมด
export async function GET(request: Request) {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(courses, { status: 200 });
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
    const { title, description, imageUrl } = body;

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
      },
    });

    return NextResponse.json(newCourse, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("CREATE_COURSE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
// ฟังก์ชันนี้จะสร้างหลักสูตรใหม่
