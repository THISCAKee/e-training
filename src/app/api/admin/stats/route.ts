// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // (Import prisma client ของคุณ)
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

    return NextResponse.json(
      {
        userCount,
        courseCount,
        lessonCount,
        enrollmentCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_STATS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
