// src/app/api/admin/courses/[id]/lessons/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

async function canManageCourse(courseId: number) {
  const session = await auth();
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  if (session.user.role !== "ORG_ADMIN" || !session.user.organizationId) {
    return false;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { organizationId: true },
  });

  return course?.organizationId === session.user.organizationId;
}

// --- GET ---
export async function GET(
  request: Request,
  // contextPromise: Promise<RouteContext>
  { params }: { params: Promise<{ id: string }> },
) {
  // 3. Await Promise
  // const { params } = await contextPromise;

  try {
    const { id } = await params;
    const courseId = parseInt(id, 10);
    if (Number.isNaN(courseId) || !(await canManageCourse(courseId))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
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

  try {
    const { id } = await params; // 4. ใช้งาน params.id
    const courseId = parseInt(id, 10);
    if (Number.isNaN(courseId) || !(await canManageCourse(courseId))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, videoUrl, duration } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { message: "Title and video URL are required" },
        { status: 400 },
      );
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
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
        courseId,
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
