// src/app/api/quiz/submit/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { use } from "react";

export async function POST(request: Request) {
  const session = await auth();

  // 1. ตรวจสอบการเข้าสู่ระบบ
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  try {
    const body = await request.json();
    const { quizId, answers } = body; // answers คือ { questionId: optionId, ... }

    if (!quizId || !answers || isNaN(userId)) {
      return NextResponse.json(
        { error: "Missing quizId or answers" },
        { status: 400 },
      );
    }

    // 2. ดึงคำตอบที่ถูกต้องจากฐานข้อมูล
    const questions = await prisma.question.findMany({
      where: {
        quizId: quizId,
      },
      include: {
        options: {
          where: {
            isCorrect: true, // เอาเฉพาะตัวเลือกที่ถูกต้อง
          },
        },
      },
    });

    let score = 0;
    const total = questions.length;
    const results: {
      questionId: number;
      selectedOptionId: number;
      isCorrect: boolean;
    }[] = [];

    // 3. ตรวจคำตอบ
    for (const q of questions) {
      const selectedOptionId = answers[q.id];
      const correctOption = q.options[0]; // แต่ละคำถามมี 1 คำตอบที่ถูก
      let isCorrect = false;

      if (correctOption && selectedOptionId === correctOption.id) {
        score++;
        isCorrect = true;
      }

      results.push({
        questionId: q.id,
        selectedOptionId: selectedOptionId,
        isCorrect: isCorrect,
      });
    }
    const percentage = total > 0 ? (score / total) * 100 : 0;
    const passed = percentage >= 70;
    const newAttempt = await prisma.quizAttempt.create({
      data: {
        userId: userId,
        quizId: quizId,
        score: score,
        total: total,
        percentage: percentage,
        passed: passed, // บันทึกสถานะการผ่าน
      },
      include: {
        quiz: {
          select: { lesson: { select: { courseId: true } } },
        },
      },
    });

    // (Optional) สามารถบันทึกผลลัพธ์นี้ลง Database (เช่น Model UserQuizAttempt)
    // แต่ใน schema ปัจจุบันยังไม่มี Model นี้
    // ถ้าสอบผ่าน ให้ไปอัปเดต Enrollment ของคอร์สนี้ด้วย
    if (passed && newAttempt.quiz?.lesson?.courseId) {
      const courseId = newAttempt.quiz.lesson.courseId;
      await prisma.userCourseEnrollment.update({
        where: {
          userId_courseId: { userId, courseId },
        },
        data: {
          status: "COMPLETED", // เปลี่ยนสถานะเป็น COMPLETED
          completedAt: new Date(), // บันทึกวันที่สำเร็จ
        },
      });
      console.log(`User ${userId} completed course ${courseId}`);
    }
    // 4. ส่งผลลัพธ์กลับไป
    return NextResponse.json({
      score,
      total,
      percentage,
      results,
      passed,
      attemptId: newAttempt.id,
    });
  } catch (error) {
    console.error("[QUIZ_SUBMIT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
