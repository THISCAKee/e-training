// src/app/api/admin/organizations/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

// PATCH - อัปเดตหน่วยงาน
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
    const orgId = parseInt(id);
    const body = await request.json();
    const { name, description } = body;

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: { select: { users: true, courses: true } },
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("UPDATE_ORGANIZATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE - ลบหน่วยงาน
export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
    const orgId = parseInt(id);

    // ลบ organization (users และ courses จะถูก set null เนื่องจาก onDelete: SetNull)
    await prisma.organization.delete({
      where: { id: orgId },
    });

    return NextResponse.json({ message: "ลบหน่วยงานสำเร็จ" });
  } catch (error) {
    console.error("DELETE_ORGANIZATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST - เพิ่ม User ให้หน่วยงาน
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
    const orgId = parseInt(id);
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "อีเมลและรหัสผ่านจำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    // ตรวจสอบ email ซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // สร้าง user ใหม่
    const user = await prisma.user.create({
      data: {
        name: name || email,
        email,
        password: await bcrypt.hash(password, 12),
        role: role || "ORG_ADMIN",
        organizationId: orgId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("ADD_ORG_USER_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
