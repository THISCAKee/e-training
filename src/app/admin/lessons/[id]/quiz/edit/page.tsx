import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizEditForm from "@/components/admin/QuizEditForm";

// ดึงข้อมูล Quiz
async function getQuizData(lessonId: number) {
  return await prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { createdAt: "asc" },
        include: {
          options: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

// ดึงข้อมูล Lesson
async function getLessonData(lessonId: number) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      courseId: true,
    },
  });
}

export default async function AdminQuizEditPage({
  params, // 1. รับ params โดยตรง
}: {
  params: Promise<{ id: string }>; // 2. ระบุว่า params เป็น Promise
}) {
  const { id } = await params; // 3. ใช้ await ก่อน destructure
  const session = await auth();

  // ตรวจสอบสิทธิ์ Admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const lessonId = parseInt(id, 10); // 4. ใช้ id ที่ได้จาก await params
  if (isNaN(lessonId)) {
    return notFound();
  }

  const lesson = await getLessonData(lessonId);
  if (!lesson) {
    return notFound();
  }

  const existingQuiz = await getQuizData(lessonId);

  return (
    <div className="container mx-auto px-4 py-10 text-black">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-500">จัดการแบบทดสอบสำหรับบทเรียน:</p>
        <h1 className="text-3xl font-bold mb-6 text-black">{lesson.title}</h1>
        <QuizEditForm
          lessonId={lesson.id}
          courseId={lesson.courseId}
          initialData={existingQuiz}
        />
      </div>
    </div>
  );
}
