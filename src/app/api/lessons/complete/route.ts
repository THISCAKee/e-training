import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const lessonId = Number(body.lessonId);
  const courseId = Number(body.courseId);
  const userId = Number(session.user.id);

  if (!Number.isInteger(lessonId) || !Number.isInteger(courseId)) {
    return NextResponse.json({ error: "Invalid lesson or course ID" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
    select: { id: true },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const progress = await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    update: {
      completed: true,
      progress: 1,
    },
    create: {
      userId,
      lessonId,
      completed: true,
      progress: 1,
    },
  });

  return NextResponse.json({ success: true, progress });
}
