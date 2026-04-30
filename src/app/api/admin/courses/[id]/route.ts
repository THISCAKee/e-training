/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/admin/courses/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

async function canManageCourse(courseId: number) {
  const session = await auth();
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  if (session.user.role !== "ORG_ADMIN" || !session.user.organizationId) {
    return false;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { organizationId: true },
  });

  return course?.organizationId === session.user.organizationId;
}

// === GET function ===
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id, 10);
    if (Number.isNaN(courseId) || !(await canManageCourse(courseId))) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// === PATCH function ===
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id, 10);
    if (Number.isNaN(courseId) || !(await canManageCourse(courseId))) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      categoryId,
      skillDataResearch,
      skillDataAnalysis,
      skillAcademicCommunication,
      skillEnglishProficiency,
      skillDataPrivacy,
    } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        title,
        description,
        imageUrl,
        videoUrl,
        categoryId: categoryId ? parseInt(categoryId) : null,
        skillDataResearch:
          skillDataResearch !== undefined ? !!skillDataResearch : undefined,
        skillDataAnalysis:
          skillDataAnalysis !== undefined ? !!skillDataAnalysis : undefined,
        skillAcademicCommunication:
          skillAcademicCommunication !== undefined
            ? !!skillAcademicCommunication
            : undefined,
        skillEnglishProficiency:
          skillEnglishProficiency !== undefined
            ? !!skillEnglishProficiency
            : undefined,
        skillDataPrivacy:
          skillDataPrivacy !== undefined ? !!skillDataPrivacy : undefined,
      } as any,
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// === DELETE function ===
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id, 10);
    if (Number.isNaN(courseId) || !(await canManageCourse(courseId))) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
