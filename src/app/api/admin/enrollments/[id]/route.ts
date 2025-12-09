import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const enrollmentId = parseInt(id);
    if (isNaN(enrollmentId)) {
        return new NextResponse("Invalid ID", { status: 400 });
    }

    await prisma.userCourseEnrollment.delete({
      where: { id: enrollmentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_ENROLLMENT_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}