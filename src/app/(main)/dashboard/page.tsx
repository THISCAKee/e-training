// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
  CheckCircle,
} from "lucide-react"; // เพิ่ม Icon
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = parseInt(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      studentId: true,
      name: true,
      email: true,
      faculty: true,
      program: true,
      major: true,
      year: true,
    },
  });

  // 1. ดึงข้อมูล Enrollments พร้อมข้อมูล Course
  const enrollments = await prisma.userCourseEnrollment.findMany({
    where: { userId: userId },
    orderBy: { enrolledAt: "desc" }, // เรียงตามล่าสุด
    include: {
      course: {
        // ดึงข้อมูล Course ที่เกี่ยวข้อง
        select: {
          id: true,
          title: true,
          imageUrl: true,
          _count: { select: { lessons: true } }, // นับจำนวนบทเรียน
        },
      },
      // (Optional) อาจจะ include UserLessonProgress เพื่อคำนวณ % ความก้าวหน้า
      user: {
        // ดึงข้อมูล user มาด้วย (เผื่อใช้)
        select: {
          quizAttempts: {
            where: { passed: true }, // เอาเฉพาะครั้งที่ผ่าน
            orderBy: { createdAt: "desc" }, // เอาครั้งล่าสุด
            take: 1, // เอาแค่ 1 รายการ
            select: {
              id: true,
              quizId: true,
              quiz: {
                select: {
                  lesson: {
                    select: {
                      courseId: true,
                    },
                  },
                },
              },
            }, // เอาแค่ ID ของ Attempt และ Quiz
          },
        },
      },
    },
  });

  // (ส่วนดึง passedAttempts สำหรับ Certificate เหมือนเดิม)
  const passedAttempts = await prisma.quizAttempt.findMany({
    where: { userId: userId, passed: true },
    orderBy: { createdAt: "desc" },
    include: {
      quiz: {
        include: {
          lesson: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // คำนวณสถิติ
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED",
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === "IN_PROGRESS",
  ).length;
  const totalCertificates = passedAttempts.length;

  // ดึงข้อมูล Quiz Attempts ทั้งหมด
  const allQuizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: userId },
    select: {
      score: true,
      passed: true,
    },
  });

  const totalQuizAttempts = allQuizAttempts.length;
  const passedQuizAttempts = allQuizAttempts.filter((a) => a.passed).length;
  const averageScore =
    totalQuizAttempts > 0
      ? (
          allQuizAttempts.reduce((sum, a) => sum + a.score, 0) /
          totalQuizAttempts
        ).toFixed(1)
      : 0;

  // สร้าง Map ของ courseId กับ attempt ที่ผ่านล่าสุด
  const latestPassedAttemptByCourse = new Map();
  enrollments.forEach((enroll) => {
    if (enroll.user?.quizAttempts && enroll.user.quizAttempts.length > 0) {
      const attempt = enroll.user.quizAttempts[0];
      // ตรวจสอบว่า attempt นี้เป็นของ course นี้จริงๆ
      if (attempt.quiz?.lesson?.courseId === enroll.courseId) {
        latestPassedAttemptByCourse.set(enroll.courseId, attempt);
      }
    }
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ส่วนข้อมูลผู้ใช้ */}
      <div className="mb-6 text-black">
        <h1 className="text-2xl font-medium ">ชื่อ {session.user.name}</h1>
        <div className="text-lg mt-1 font-medium">
          รหัสนิสิต: {user?.studentId}
        </div>
        <div>
          <span className="font-medium text-lg">คณะ:</span>{" "}
          {user?.faculty || "-"}
        </div>
        <div>
          <span className="font-medium text-lg">สาขา:</span>{" "}
          {user?.major || "-"}
        </div>
        <div>
          <span className="font-medium text-lg">หลักสูตร:</span>{" "}
          {user?.program || "-"}
        </div>
        <div>
          <span className="font-medium text-lg">ชั้นปี:</span>{" "}
          {user?.year ? `${user.year}` : "-"}
        </div>
      </div>

      {/* ส่วนสถิติภาพรวม */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* การ์ดจำนวนหลักสูตรทั้งหมด */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">หลักสูตรทั้งหมด</p>
              <p className="text-3xl font-bold text-blue-600">{totalCourses}</p>
            </div>
            <BookOpen size={40} className="text-blue-500 opacity-70" />
          </div>
        </div>

        {/* การ์ดกำลังเรียน */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">กำลังเรียน</p>
              <p className="text-3xl font-bold text-yellow-600">
                {inProgressCourses}
              </p>
            </div>
            <TrendingUp size={40} className="text-yellow-500 opacity-70" />
          </div>
        </div>

        {/* การ์ดเรียนจบแล้ว */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">เรียนจบแล้ว</p>
              <p className="text-3xl font-bold text-green-600">
                {completedCourses}
              </p>
            </div>
            <CheckCircle size={40} className="text-green-500 opacity-70" />
          </div>
        </div>

        {/* การ์ดใบประกาศนียบัตร */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">ใบประกาศนียบัตร</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalCertificates}
              </p>
            </div>
            <GraduationCap size={40} className="text-purple-500 opacity-70" />
          </div>
        </div>
      </div>

      {/* ส่วนข้อมูลเพิ่มเติม */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4 text-black">
          สถิติการทำแบบทดสอบ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              จำนวนครั้งที่ทำแบบทดสอบ
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {totalQuizAttempts} ครั้ง
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">จำนวนครั้งที่สอบผ่าน</p>
            <p className="text-2xl font-bold text-green-600">
              {passedQuizAttempts} ครั้ง
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">คะแนนเฉลี่ย</p>
            <p className="text-2xl font-bold text-purple-600">
              {averageScore}%
            </p>
          </div>
        </div>
      </div>

      {/* --- vvvv 2. เพิ่มส่วนแสดง My Courses vvvv --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 text-black">หลักสูตรของคุณ</h2>
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enroll) => {
              // หา attempt ที่ผ่านล่าสุดสำหรับ course นี้
              const latestPassedAttemptInCourse =
                latestPassedAttemptByCourse.get(enroll.courseId);

              return (
                <div
                  key={enroll.id}
                  className="border rounded-lg overflow-hidden flex flex-col bg-gray-50"
                >
                  {/* (Optional: ใส่รูปภาพ Course) */}
                  {enroll.course.imageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={enroll.course.imageUrl}
                        alt={enroll.course.title}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg text-blue-800 mb-2">
                      {enroll.course.title}
                    </h3>
                    <div className="text-sm text-gray-600 flex items-center mb-1">
                      <BookOpen size={14} className="mr-2" />{" "}
                      {enroll.course._count.lessons} บทเรียน
                    </div>
                    <div className="text-sm text-gray-600 flex items-center mb-4">
                      <Clock size={14} className="mr-2" /> ลงทะเบียนเมื่อ:{" "}
                      {enroll.enrolledAt.toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    {/* (Optional: แสดง Progress Bar) */}
                    {/* <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: '45%'}}></div></div> */}

                    <div className="mt-auto">
                      {" "}
                      {/* ดันปุ่มลงล่าง */}
                      {/* --- vvvv แก้ไข Logic ปุ่ม vvvv --- */}
                      {enroll.status === "COMPLETED" &&
                      latestPassedAttemptInCourse ? (
                        // ถ้าเรียนจบแล้ว และหา Attempt ที่ผ่านเจอ
                        <Link
                          href={`/results/${latestPassedAttemptInCourse.id}`} // <-- ลิงก์ไปหน้าผลลัพธ์
                          className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm"
                        >
                          <FileText size={16} className="mr-2" />
                          สำเร็จการศึกษา (ดูผลคะแนน)
                        </Link>
                      ) : enroll.status === "COMPLETED" ? (
                        // ถ้าเรียนจบ แต่หา Attempt ไม่เจอ (เผื่อกรณีข้อมูลไม่ครบ)
                        <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
                          สำเร็จการศึกษา
                        </span>
                      ) : (
                        // ถ้ายังไม่จบ (IN_PROGRESS)
                        <Link
                          href={`/courses/${enroll.courseId}/learn`}
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm"
                        >
                          เรียนต่อ
                        </Link>
                      )}
                      {/* --- ^^^^ สิ้นสุดการแก้ไข Logic ปุ่ม ^^^^ --- */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            คุณยังไม่ได้ลงทะเบียนเรียนหลักสูตรใด
          </p>
        )}
      </div>
      {/* --- ^^^^ สิ้นสุดส่วน My Courses ^^^^ --- */}

      {/* (ส่วนแสดง Certificate เหมือนเดิม) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-black">
          ใบประกาศนียบัตรของคุณ
        </h2>
        {passedAttempts.length > 0 ? (
          <ul className="space-y-4">
            {passedAttempts.map((attempt) => (
              <li
                key={attempt.id}
                className="flex justify-between items-center p-3 border-b"
              >
                <div>
                  <h3 className="font-semibold  text-gray-600">
                    {attempt.quiz?.lesson?.course?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    สอบผ่านเมื่อ:{" "}
                    {attempt.createdAt.toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <a
                  href={`/api/certificate/generate/${attempt.quizId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm"
                >
                  <Award size={16} className="mr-2" />
                  ดูใบประกาศนียบัตร
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">
            คุณยังไม่มีใบประกาศนียบัตร
          </p>
        )}
      </div>
    </div>
  );
}
