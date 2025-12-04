// src/app/quiz/[id]/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizForm from "@/components/QuizForm";

interface QuizPageProps {
  params: Promise<{
    id: string; // นี่คือ lessonId
  }>;
}

// ฟังก์ชันสำหรับตรวจสอบการเรียนจบทุกบทเรียน
async function checkCompletion(lessonId: number, userId: string) {
  // แปลง userId จาก string เป็น number
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    console.error("Invalid User ID format:", userId);
    return false;
  }

  // 1. หา Course ID จาก Lesson ID
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true },
  });

  if (!lesson) {
    return false;
  }
  const courseId = lesson.courseId;

  // 2. นับจำนวนบทเรียนทั้งหมดในคอร์ส
  const totalLessons = await prisma.lesson.count({
    where: { courseId: courseId },
  });

  // 3. นับจำนวนบทเรียนที่ User คนนี้เรียนจบในคอร์สนี้
  const completedCount = await prisma.userLessonProgress.count({
    where: {
      userId: userIdNum, // ใช้ userId ที่แปลงเป็น number แล้ว
      completed: true,
      lesson: {
        courseId: courseId,
      },
    },
  });

  // 4. เปรียบเทียบ
  return totalLessons > 0 && totalLessons === completedCount;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await auth();

  // 1. ตรวจสอบการเข้าสู่ระบบ
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) {
    return notFound();
  }

  // ตรวจสอบว่าผู้ใช้เรียนจบทุกบทเรียนในคอร์สแล้วหรือไม่
  const allCompleted = await checkCompletion(lessonId, session.user.id);
  if (!allCompleted) {
    // หา Course ID เพื่อ Redirect กลับ
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });
    const courseId = lesson?.courseId || "";

    // Redirect กลับไปหน้าคอร์ส ถ้ายังเรียนไม่ครบ
    redirect(`/courses/${courseId}?error=not_completed`);
  }

  // 2. แปลง userId จาก string เป็น integer
  const userId = parseInt(session.user.id, 10);
  if (isNaN(userId)) {
    console.error("Invalid User ID format:", session.user.id);
    return notFound();
  }

  // 3. ดึงข้อมูล Quiz
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      lesson: {
        select: {
          title: true,
          courseId: true,
        },
      },
      questions: {
        orderBy: { id: "asc" },
        include: {
          options: {
            select: {
              id: true,
              text: true,
            },
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">บทเรียนนี้ยังไม่มีแบบทดสอบ</h1>
      </div>
    );
  }

  // 4. นับจำนวนบทเรียนที่ User คนนี้เรียนจบในคอร์สนี้
  const completedCount = await prisma.userLessonProgress.count({
    where: {
      userId: userId, // ใช้ integer
      completed: true,
      lesson: {
        courseId: quiz.lesson.courseId,
      },
    },
  });

  // 5. นับจำนวนบทเรียนทั้งหมดในคอร์ส
  const totalLessons = await prisma.lesson.count({
    where: {
      courseId: quiz.lesson.courseId,
    },
  });

  // 6. สร้างข้อมูลสำหรับ Client Component
  const quizDataForClient = {
    id: quiz.id,
    title: quiz.title,
    lessonTitle: quiz.lesson.title,
    courseId: quiz.lesson.courseId,
    questions: quiz.questions.map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    })),
    progress: {
      completed: completedCount,
      total: totalLessons,
    },
  };

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 text-black">
      <QuizForm quizData={quizDataForClient} />
    </div>
  );
}
