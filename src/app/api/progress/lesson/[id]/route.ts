import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RouteContext {
  params: {
    id: string; // lessonId
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  // Debug log
  console.log("Session:", session);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = parseInt(id, 10);
  const userId = parseInt(session.user.id, 10);

  if (isNaN(lessonId) || isNaN(userId)) {
    return NextResponse.json({ error: "Invalid Lesson ID" }, { status: 400 });
  }

  try {
    const progress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId: userId,
        lessonId: lessonId,
        completed: true,
        progress: 1.0,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("[LESSON_PROGRESS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
