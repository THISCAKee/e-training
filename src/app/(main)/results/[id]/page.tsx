// src/app/results/[id]/page.tsx

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Award } from "lucide-react";

// (Interface สำหรับ Props และ Context แก้ปัญหา Next.js 15)
interface ResultPageProps {
  params: Promise<{ id: string }>;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RouteContext {
  params: Promise<{ id: string }>;
} // ใช้ RouteContext เหมือน API

export default async function ResultPage(
  contextPromise: Promise<ResultPageProps>,
) {
  const { params } = await contextPromise;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  const userId = parseInt(session.user.id);
  const attemptId = parseInt((await params).id);

  if (isNaN(attemptId) || isNaN(userId)) return notFound();

  // 1. ดึงข้อมูล QuizAttempt ที่ระบุ ต้องเป็นของ User คนนี้เท่านั้น
  const attempt = await prisma.quizAttempt.findUnique({
    where: {
      id: attemptId,
      userId: userId, // !! สำคัญ: ตรวจสอบว่าเป็นของ User คนนี้จริง !!
    },
    include: {
      quiz: {
        // ดึงข้อมูล Quiz, Lesson, Course
        include: {
          lesson: {
            include: {
              course: { select: { id: true, title: true } },
            },
          },
          // ดึง Questions และ Options มาด้วยเพื่อแสดงเฉลย (ถ้าต้องการ)
          // **คำเตือน:** การดึงข้อมูลเฉลยอาจทำให้ query ซับซ้อน
          // ถ้าไม่ต้องการแสดงเฉลย ไม่ต้อง include ส่วนนี้
          // questions: {
          //    orderBy: { createdAt: 'asc' },
          //    include: {
          //       options: { orderBy: { createdAt: 'asc' }}
          //    }
          // }
        },
      },
    },
  });

  // 2. ถ้าไม่พบ Attempt หรือไม่ใช่ของ User นี้
  if (!attempt) return notFound();

  // 3. เตรียมข้อมูลแสดงผล
  const quizTitle = attempt.quiz.title;
  const courseTitle = attempt.quiz.lesson.course.title;
  const courseId = attempt.quiz.lesson.course.id; // เอาไว้สร้าง Link กลับ

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-center text-black">
          ผลการทดสอบ
        </h2>
        <p className="text-xl mb-2 text-center text-gray-700">{quizTitle}</p>
        <p className="text-md mb-6 text-center text-gray-500">
          หลักสูตร: {courseTitle}
        </p>

        <p className="text-lg mb-6 text-center text-black">
          คุณได้{" "}
          <span className="font-bold text-blue-600">{attempt.score}</span> /{" "}
          {attempt.total} คะแนน
        </p>
        <div
          className={`text-5xl font-bold text-center mb-8 ${attempt.passed ? "text-green-600" : "text-red-600"}`}
        >
          {attempt.percentage.toFixed(0)}%
        </div>

        {/* (แสดงข้อความผ่าน/ไม่ผ่าน และปุ่ม Certificate เหมือนเดิม) */}
        {attempt.passed ? (
          <div className="text-center p-6 bg-green-50 border border-green-300 rounded-lg mb-8">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-2xl font-semibold text-green-800 mb-2">
              ยินดีด้วย! คุณผ่านเกณฑ์แล้ว
            </h3>
            <a
              href={`/api/certificate/generate/${attempt.quizId}`}
              target="_blank"
              className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mt-4"
            >
              ดูใบประกาศนียบัตร (รูปภาพ)
            </a>
          </div>
        ) : (
          <div className="text-center p-6 bg-red-50 border border-red-300 rounded-lg mb-8">
            <h3 className="text-2xl font-semibold text-red-800 mb-2">
              ยังไม่ผ่านเกณฑ์
            </h3>
            <p className="text-red-700">คุณต้องได้คะแนน 70% ขึ้นไป</p>
          </div>
        )}

        {/* (Optional: แสดงเฉลยรายข้อ - ต้อง query ข้อมูลมาเพิ่ม) */}
        {/* <div className="space-y-4 mb-8 border-t pt-8">
               <h3 className="text-xl font-semibold text-black">รายละเอียดคำตอบ</h3>
               {attempt.quiz.questions?.map((q, index) => (
                  // ... Logic แสดงเฉลย (ต้องมีข้อมูล selectedOptionId ซึ่งไม่ได้เก็บใน attempt) ...
                  // การแสดงเฉลยในหน้านี้อาจจะยาก ควรแสดงใน QuizForm ทันทีหลังทำเสร็จดีกว่า
               ))}
            </div> */}

        {/* ปุ่มกลับ Dashboard หรือ Course Detail */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href={`/courses/${courseId}`}
            className="text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            กลับไปหน้าคอร์ส
          </Link>
          <Link
            href="/dashboard"
            className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            ไปที่ Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
