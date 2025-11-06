// src/app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // (Import prisma client ของคุณ)
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;

    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { studentId: { contains: search } },
          ],
        }
      : {};

    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          studentId: true, // (เพิ่ม) ดึง studentId มาด้วย
          faculty: true, // (เพิ่ม)
        },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: pageSize,
      }),
      prisma.user.count({
        where: whereCondition,
      }),
    ]);

    return NextResponse.json(
      {
        data: users,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
