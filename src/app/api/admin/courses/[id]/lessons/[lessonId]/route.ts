// src/app/api/admin/courses/[id]/lessons/[lessonId]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 1. Interface ต้องมี params ทั้งสองตัว
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RouteContext {
  params: {
    id?: string; // Course ID
    lessonId?: string; // Lesson ID
  };
}

// --- GET: ดึง Lesson เดียว ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }, // 1. เปลี่ยนรูปแบบการรับ params
) {
  // 2. ใช้ await ก่อนเข้าถึง params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, lessonId } = await params;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) },
      include: { quiz: true },
    });
    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error("GET_SINGLE_LESSON_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- PATCH: แก้ไข Lesson เดียว ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }, // 1. เปลี่ยนรูปแบบการรับ params
) {
  // 2. ใช้ await ก่อนเข้าถึง params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, lessonId } = await params;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 });
    }
    const body = await request.json();
    const { title, videoUrl, duration, order } = body;

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(lessonId) },
      data: {
        title,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        order: order ? parseInt(order) : undefined,
      },
    });
    return NextResponse.json(updatedLesson, { status: 200 });
  } catch (error) {
    console.error("UPDATE_LESSON_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- DELETE: ลบ Lesson เดียว ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }, // 1. เปลี่ยนรูปแบบการรับ params
) {
  // 2. ใช้ await ก่อนเข้าถึง params
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, lessonId } = await params;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 });
    }
    await prisma.lesson.delete({
      where: { id: parseInt(lessonId) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_LESSON_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
