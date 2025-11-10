// src/app/api/courses/category/[categoryName]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// (แก้ปัญหา Next.js 15+)
interface RouteContext {
  params: Promise<{
    categoryName: string; // ชื่อต้องตรงกับโฟลเดอร์ [categoryName]
  }>;
}

export async function GET(
  request: Request,
  contextPromise: Promise<RouteContext>,
) {
  const { params } = await contextPromise;
  const resolvedParams = await params; // await params อีกครั้ง

  try {
    // 1. Decode ชื่อ Category จาก URL (เช่น ถ้าชื่อมีเว้นวรรค)
    const categoryName = decodeURIComponent(resolvedParams.categoryName);

    // 2. ค้นหาคอร์สที่ Category "name" ตรงกับที่ส่งมา
    const courses = await prisma.course.findMany({
      where: {
        category: {
          name: categoryName,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      // (Optional) อาจจะ include category name มาด้วยก็ได้
      // include: {
      //   category: { select: { name: true } }
      // }
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("GET_COURSES_BY_CATEGORY_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
