// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// === PATCH function ===
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // 1. รับ params เป็น Promise
) {
  const { id } = await params; // 2. Await ก่อนใช้งาน

  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (!id || !["USER", "ADMIN"].includes(role)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: role },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("UPDATE_USER_ROLE_ERROR", error);
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
