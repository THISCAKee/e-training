/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/admin/courses/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

// === GET function ===
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// === PATCH function ===
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, imageUrl, videoUrl, categoryId } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id!) },
      data: {
        title,
        description,
        imageUrl,
        videoUrl,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// === DELETE function ===
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.course.delete({
      where: { id: parseInt(id!) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
