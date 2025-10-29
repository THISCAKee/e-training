// src/app/api/enroll/[id]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  // 1. ตรวจสอบ Session
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const courseId = parseInt(id);

  if (isNaN(courseId) || isNaN(userId)) {
    return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
  }

  try {
    // 2. ตรวจสอบว่าคอร์สมีอยู่จริงหรือไม่
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 3. ตรวจสอบว่าเคยลงทะเบียนคอร์สนี้แล้วหรือยัง
    const existingEnrollment = await prisma.userCourseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    // ถ้ายังไม่เคยลงทะเบียน ให้สร้างใหม่
    if (!existingEnrollment) {
      await prisma.userCourseEnrollment.create({
        data: {
          userId: userId,
          courseId: courseId,
          status: "IN_PROGRESS", // เริ่มต้นด้วยสถานะ "กำลังเรียน"
        },
      });
      console.log(`User ${userId} enrolled in course ${courseId}`);
      // คืนค่า success เพื่อให้ Client รู้ว่าลงทะเบียนสำเร็จแล้ว
      return NextResponse.json({
        success: true,
        message: "Enrollment successful",
        enrollment: {
          userId,
          courseId,
          status: "IN_PROGRESS",
        },
      });
    } else {
      // ถ้าเคยลงทะเบียนแล้ว (ไม่ว่าจะสถานะไหน) ก็แค่บอกว่าสำเร็จ (เพื่อให้ไปต่อได้)
      console.log(`User ${userId} already enrolled in course ${courseId}`);
      return NextResponse.json({
        success: true,
        message: "Already enrolled",
        enrollment: {
          userId,
          courseId,
          status: existingEnrollment.status,
        },
      });
    }
  } catch (error) {
    console.error("ENROLLMENT_ERROR", error);

    // ตรวจจับ Unique constraint error เผื่อกรณี race condition
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json({
        success: true,
        message: "Already enrolled (concurrent)",
      });
    }

    // ตรวจจับกรณีที่ model ไม่พบ (กรณียังไม่ได้ generate prisma client)
    if (
      error instanceof Error &&
      error.message.includes("Cannot read properties of undefined")
    ) {
      return NextResponse.json(
        {
          error:
            "Prisma client not generated. Please run 'npx prisma generate'",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
