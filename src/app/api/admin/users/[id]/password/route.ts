import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcrypt";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  // ตรวจสอบว่าเป็น Admin หรือไม่
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return new NextResponse("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร", {
        status: 400,
      });
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดตลงฐานข้อมูล
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE_PASSWORD_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
