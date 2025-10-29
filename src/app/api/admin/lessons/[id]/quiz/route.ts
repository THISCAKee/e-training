// src/app/api/admin/lessons/[id]/quiz/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Type QuizQuestion เหมือนเดิม
type QuizQuestion = {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
};

// POST หรือ PUT
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // ✅ ปรับเป็น Promise โดยตรง
) {
  // ✅ ใช้ await params ก่อนเข้าถึง property
  const { id } = await params;

  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ ใช้ id ที่ได้จาก await params
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, questions } = body;

    // Validation logic เหมือนเดิม
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "กรุณาใส่ชื่อแบบทดสอบ" },
        { status: 400 },
      );
    }
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'ข้อมูล "questions" ไม่ถูกต้อง (ต้องเป็น Array)' },
        { status: 400 },
      );
    }

    // Prisma Upsert logic เหมือนเดิม
    const quiz = await prisma.quiz.upsert({
      where: { lessonId: lessonId },
      update: {
        title: title,
        questions: {
          deleteMany: {},
          create: (questions as QuizQuestion[]).map((q) => ({
            text: q.text,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
      create: {
        title: title,
        lessonId: lessonId,
        questions: {
          create: (questions as QuizQuestion[]).map((q) => ({
            text: q.text,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_UPSERT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// GET
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // ✅ ปรับเป็น Promise โดยตรง
) {
  // ✅ ใช้ await params ก่อนเข้าถึง property
  const { id } = await params;

  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ ใช้ id ที่ได้จาก await params
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
  }

  try {
    // Prisma findUnique logic เหมือนเดิม
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId: lessonId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
