// src/app/courses/[id]/page.tsx (หน้าใหม่: Course Detail)

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react"; // ไอคอน (Optional)
import { StartLearningButton } from "@/components/StartLearningButton";
import { auth } from "@/auth";

// Interface สำหรับ Props (แก้ปัญหา Next.js 15)
interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ฟังก์ชันดึงข้อมูลเฉพาะที่จำเป็นสำหรับหน้านี้
async function getCourseSummary(id: string) {
  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    return null;
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        _count: {
          // ใช้ _count เพื่อนับจำนวน lessons ที่เกี่ยวข้อง
          select: { lessons: true },
        },
      },
    });
    return course;
  } catch (error) {
    console.error("Failed to fetch course summary:", error);
    return null;
  }
}

async function getUserCourseData(courseId: number, userId: number | undefined) {
  if (!userId) return { enrollment: null, latestPassedAttemptId: null };
  try {
    // ดึง Enrollment
    const enrollment = await prisma.userCourseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      select: {
        status: true,
      },
    });
    // ถ้า Enrollment เป็น COMPLETED ให้หา Attempt ล่าสุดที่ผ่าน
    let latestPassedAttemptId: number | null = null;
    if (enrollment?.status === "COMPLETED") {
      const attempt = await prisma.quizAttempt.findFirst({
        where: {
          userId: userId,
          passed: true,
          // หา QuizAttempt ที่อยู่ใน Course นี้
          quiz: {
            lesson: {
              courseId: courseId,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      latestPassedAttemptId = attempt?.id ?? null;
    }

    return { enrollment, latestPassedAttemptId };
  } catch (error) {
    console.error("Failed to fetch user course data:", error);
    return { enrollment: null, latestPassedAttemptId: null };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserEnrollment(courseId: number, userId: number | undefined) {
  if (!userId) return null;
  try {
    return await prisma.userCourseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      select: {
        status: true, // เอาแค่สถานะก็พอ
        // completedAt: true // อาจจะเอามาใช้แสดงสถานะละเอียดขึ้น
      },
    });
  } catch (error) {
    console.error("Failed to fetch enrollment:", error);
    return null;
  }
}

export default async function CourseDetailPage(
  props: CourseDetailPageProps, // แก้ปัญหา Next.js 15
) {
  const { id } = await props.params;
  // const { params } = await contextPromise;
  const session = await auth(); // ดึง session
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined; // แก้ปัญหา Next.js 15
  const course = await getCourseSummary(id);

  if (!course) {
    return notFound();
  }
  const { enrollment, latestPassedAttemptId } = await getUserCourseData(
    course.id,
    userId,
  );
  const enrollmentStatus = enrollment?.status ?? null;
  // const enrollment = await getUserEnrollment(course.id, userId);
  const isEnrolled = !!enrollment; // เช็คว่ามี enrollment หรือไม่
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canStartLearning = !isEnrolled || enrollment?.status === "IN_PROGRESS";

  const lessonCount = course._count.lessons;

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* ส่วนรูปภาพ Poster */}
          {course.imageUrl ? (
            <div className="relative w-full h-64 md:h-80">
              {" "}
              {/* กำหนดความสูง */}
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill // ให้รูปเต็มพื้นที่ div แม่
                style={{ objectFit: "cover" }} // ให้รูป cover พื้นที่
                priority // โหลดรูปนี้ก่อน
                // เพิ่ม unoptimized ถ้าใช้ placeholder หรือ host ภายนอกที่ไม่รองรับ optimization
                unoptimized={
                  course.imageUrl.includes("placehold.co") ||
                  course.imageUrl.startsWith("http")
                }
              />
            </div>
          ) : (
            // กรณีไม่มีรูปภาพ
            <div className="h-64 md:h-80 bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center">
              <BookOpen size={64} className="text-blue-300" />
            </div>
          )}

          {/* ส่วนรายละเอียด */}
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 text-lg mb-6 whitespace-pre-line">
              {" "}
              {/* whitespace-pre-line เผื่อมีขึ้นบรรทัดใหม่ใน description */}
              {course.description}
            </p>

            <div className="flex items-center text-gray-500 mb-8">
              <BookOpen size={20} className="mr-2" />
              <span>{lessonCount} บทเรียน</span>
            </div>

            {session?.user ? ( // แสดงปุ่มเฉพาะเมื่อ Login
              <StartLearningButton
                courseId={course.id}
                enrollmentStatus={enrollmentStatus}
                latestPassedAttemptId={latestPassedAttemptId}
                //isDisabled={!canStartLearning} // (Optional) อาจ disable ปุ่มถ้าเรียนจบแล้ว
              />
            ) : (
              // กรณี ยังไม่ได้ Login
              <Link
                href="/login"
                className="inline-block bg-gray-400 text-white font-bold text-lg px-8 py-3 rounded-md shadow-md cursor-not-allowed"
              >
                เข้าสู่ระบบเพื่อเริ่มเรียน
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
