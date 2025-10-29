// src/app/api/admin/courses/[id]/lessons/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 1. แก้ไข RouteContext
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RouteContext = {
  params: {
    id: string; // Course ID
  };
};

// --- GET ---
export async function GET(
  request: Request,
  // contextPromise: Promise<RouteContext>
  { params }: { params: Promise<{ id: string }> },
) {
  // 3. Await Promise
  // const { params } = await contextPromise;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const lessons = await prisma.lesson.findMany({
      where: { courseId: parseInt(id) },
      orderBy: { order: "asc" },
      include: { quiz: { select: { id: true, title: true } } },
    });
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error("GET_LESSONS_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- POST ---
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // 2. รับเป็น Promise
) {
  // 3. Await Promise

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params; // 4. ใช้งาน params.id
    const body = await request.json();
    const { title, videoUrl, duration } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { message: "Title and video URL are required" },
        { status: 400 },
      );
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId: parseInt(id) },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastLesson?.order || 0) + 1;

    const newLesson = await prisma.lesson.create({
      data: {
        title,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        order: nextOrder,
        courseId: parseInt(id),
      },
    });
    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error("CREATE_LESSON_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
