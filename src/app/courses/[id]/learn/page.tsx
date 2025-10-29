// src/app/courses/[id]/learn/page.tsx

// (Optional) บังคับให้ revalidate ทุกครั้งที่เข้าหน้านี้ เพื่อให้ข้อมูล progress สดใหม่เสมอ
export const dynamic = "force-dynamic";

import ProtectedContent from "@/components/ProtectedContent";
import CoursePlayer from "@/components/CoursePlayer";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

// --- Type Definitions ---
// (ควรจะเหมือนกับในไฟล์ Course Detail เดิม หรือดึงมาจากไฟล์กลาง)
type QuizInfo = {
  id: number;
} | null;

type Lesson = {
  id: number;
  title: string;
  videoUrl: string;
  duration?: number | null;
  quiz: QuizInfo;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Course = {
  id: number;
  title: string;
  description: string; // อาจจะไม่จำเป็นต้องใช้ในหน้านี้ แต่ดึงมาเผื่อ
  lessons: Lesson[];
};
// --- End Type Definitions ---

// --- Props Interface (แก้ปัญหา Next.js 15) ---
interface CourseLearnPageProps {
  params: Promise<{
    id: string; // Course ID
  }>;
}
// --- End Props Interface ---

// --- Function ดึงข้อมูล (คล้ายกับของ Course Detail เดิม) ---
async function getCourseLearnData(
  courseId: number,
  userId: number | undefined, // รับ userId เพื่อดึง progress
) {
  try {
    // 1. ดึงข้อมูล Course พร้อม Lessons และ Quiz
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            quiz: { select: { id: true } }, // เอาแค่ id ของ quiz
          },
        },
      },
    });

    if (!course) return null; // ไม่พบคอร์ส

    // 2. ดึงข้อมูล Progress ของ User ถ้า Login อยู่
    let completedLessonIds = new Set<number>();
    if (userId) {
      const progress = await prisma.userLessonProgress.findMany({
        where: {
          userId: userId,
          lesson: { courseId: courseId }, // progress ของคอร์สนี้เท่านั้น
          completed: true,
        },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(progress.map((p) => p.lessonId));
    }

    return { course, completedLessonIds };
  } catch (error) {
    console.error("Failed to fetch course learn data:", error);
    return null; // กรณีเกิด Error อื่นๆ
  }
}
// --- End Function ดึงข้อมูล ---

// --- Main Page Component ---
export default async function CourseLearnPage(
  contextPromise: Promise<CourseLearnPageProps>, // แก้ปัญหา Next.js 15
) {
  // 1. Await props และ ดึง session
  const { params } = await contextPromise;
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined;
  const userRole = session?.user?.role;

  // 2. ตรวจสอบ Login
  if (!userId) {
    // ถ้ายังไม่ Login, redirect ไปหน้า Login พร้อม callback กลับมาหน้านี้
    const callbackUrl = encodeURIComponent(
      `/courses/${(await params).id}/learn`,
    );
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  // 3. ตรวจสอบ Course ID
  const courseId = parseInt((await params).id);
  if (isNaN(courseId)) {
    return notFound(); // แสดง 404 ถ้า ID ไม่ใช่ตัวเลข
  }

  // --- vvvv 4. ตรวจสอบ Enrollment vvvv ---
  const enrollment = await prisma.userCourseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { status: true }, // เอาแค่ status ก็พอ
  });

  // ถ้าไม่พบ Enrollment (ยังไม่กด "เริ่มเรียน" จากหน้า Detail)
  // หรือ Status ไม่ใช่ IN_PROGRESS (อาจจะ COMPLETED หรือมีสถานะอื่นในอนาคต)
  // ให้ redirect กลับไปหน้า Course Detail พร้อมแจ้งเตือน
  if (!enrollment || enrollment.status !== "IN_PROGRESS") {
    console.warn(
      `User ${userId} tried to access learn page for course ${courseId} without valid enrollment.`,
    );
    redirect(`/courses/${courseId}?error=not_enrolled`);
  }
  // --- ^^^^ สิ้นสุดการตรวจสอบ Enrollment ^^^^ ---

  // 5. ดึงข้อมูล Course และ Progress
  const data = await getCourseLearnData(courseId, userId);

  // ถ้าหา Course ไม่เจอ (อาจถูกลบไปแล้ว)
  if (!data?.course) {
    return notFound();
  }

  const { course, completedLessonIds } = data;
  const totalLessons = course.lessons.length;
  const completedCount = completedLessonIds.size;

  // 6. คำนวณว่าเรียนจบทุกบทหรือยัง
  const allLessonsCompleted =
    totalLessons > 0 && completedCount === totalLessons;

  // 7. Render หน้าเว็บ
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* (Optional: อาจเพิ่ม Breadcrumbs หรือ Header ย่อย) */}
      <div className="container mx-auto px-4 py-8">
        {/* ProtectedContent อาจจะไม่จำเป็นแล้ว เพราะเราเช็ค Login ข้างบนแล้ว
            แต่ใส่ไว้ก็ไม่เสียหาย หรือจะลบออกก็ได้ */}
        <ProtectedContent>
          <CoursePlayer
            course={course}
            completedLessonIds={completedLessonIds}
            allLessonsCompleted={allLessonsCompleted}
            totalLessons={totalLessons}
            userRole={userRole}
          />
        </ProtectedContent>
      </div>
    </div>
  );
}
// --- End Main Page Component ---
