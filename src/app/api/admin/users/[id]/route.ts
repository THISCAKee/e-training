// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// === เพิ่มฟังก์ชัน GET นี้ลงไป ===
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("GET_USER_DETAILS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// === PATCH function ===
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "ORG_ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await request.json();
    const { role, name, studentId, faculty, major, year } = body;

    if (!id) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const dataToUpdate: any = {};
    if (role && ["USER", "ORG_ADMIN", "ADMIN"].includes(role)) {
      // Only ADMIN can change roles
      if (session?.user?.role === "ADMIN") {
        dataToUpdate.role = role;
      }
    }
    if (name !== undefined) dataToUpdate.name = name;
    if (studentId !== undefined) dataToUpdate.studentId = studentId;
    if (faculty !== undefined) dataToUpdate.faculty = faculty;
    if (major !== undefined) dataToUpdate.major = major;
    if (year !== undefined) dataToUpdate.year = year;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// === DELETE function ===
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // 1. รับ params เป็น Promise
) {
  const { id } = await params; // 2. Await ก่อนใช้งาน

  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    if (!id) {
      return new NextResponse("User ID not found", { status: 400 });
    }

    if (parseInt(id) === parseInt(session.user.id as string)) {
      return new NextResponse("Cannot delete your own account", {
        status: 400,
      });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error) {
    console.error("DELETE_USER_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
