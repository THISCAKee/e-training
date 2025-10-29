// src/app/api/admin/users/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// 1. เปลี่ยน Interface นี้ (IParams)
interface RouteContext {
  params: {
    id: string;
  };
}

// === PATCH function ===
export async function PATCH(
  request: Request,
  contextPromise: Promise<RouteContext> // 2. รับเป็น Promise
) {
  // 3. Await Promise
  const { params } = await contextPromise;

  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = params; // 4. ใช้งาน params.id
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
  contextPromise: Promise<RouteContext> // 2. รับเป็น Promise
) {
  // 3. Await Promise
  const { params } = await contextPromise;

  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = params; // 4. ใช้งาน params.id

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
