// src/app/certificate/quiz/[id]/page.tsx

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
// import { Award } from "lucide-react"; // ไอคอน
import CertificateDisplay from "@/components/CertificateDisplay";
interface CertificatePageProps {
  params: Promise<{
    id: string; // นี่คือ quizId
  }>;
}

// (ฟังก์ชันแก้ปัญหา Next.js 15)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RouteContext {
  params: {
    id: string;
  };
}

export default async function CertificatePage(
  contextPromise: Promise<CertificatePageProps>,
) {
  const { params } = await contextPromise;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id, 10);
  const { id } = await params;
  const quizId = parseInt(id, 10);

  if (isNaN(quizId) || isNaN(userId)) {
    return notFound();
  }

  // 1. ดึงข้อมูลการทำแบบทดสอบล่าสุดที่ "ผ่าน" ของผู้ใช้คนนี้สำหรับ Quiz นี้
  const latestPassedAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: userId,
      quizId: quizId,
      passed: true,
    },
    orderBy: {
      createdAt: "desc", // เอาอันล่าสุด
    },
    include: {
      user: {
        // ดึงชื่อผู้ใช้
        select: { name: true },
      },
      quiz: {
        // ดึงชื่อ Quiz และเชื่อมไปหาชื่อ Course
        include: {
          lesson: {
            include: {
              course: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });

  // 2. ถ้าไม่เคยทำผ่าน หรือหาไม่เจอ
  if (!latestPassedAttempt) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-4">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">ไม่พบข้อมูล</h1>
          <p className="text-lg text-gray-700">
            คุณยังไม่ได้ทำแบบทดสอบนี้ผ่านเกณฑ์ หรือข้อมูลอาจมีปัญหา
          </p>
          {/* (อาจมี Link กลับไปหน้า Courses) */}
        </div>
      </div>
    );
  }

  // 3. เตรียมข้อมูลสำหรับแสดงผล
  const userName = latestPassedAttempt.user.name || "ผู้ใช้งาน";
  const courseTitle = latestPassedAttempt.quiz.lesson.course.title;
  const completionDate = latestPassedAttempt.createdAt.toLocaleDateString(
    "th-TH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // 4. แสดงผลใบประกาศ (ใช้ Tailwind CSS จัดหน้าตา)
  // (คุณสามารถออกแบบส่วนนี้ให้สวยงามได้ตามต้องการ)
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <CertificateDisplay
        userName={userName}
        courseTitle={courseTitle}
        completionDate={completionDate}
        // (Optional: ส่ง path โลโก้, ชื่อ director ถ้าต้องการ)
        // logoPath="/your-logo.png"
        // directorName="ชื่อ ผอ."
        // directorTitle="ตำแหน่ง ผอ."
      />
    </div>
  );
}
