import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const courseEnrollmentStats = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        {
          enrollments: {
            _count: "desc",
          },
        },
        {
          title: "asc",
        },
      ],
    });

    return NextResponse.json({ courseEnrollmentStats }, { status: 200 });
  } catch (error) {
    console.error("GET_PUBLIC_STATS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
