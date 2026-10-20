import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { validateProfileChoice } from "@/lib/faculties";

// ผู้ใช้ตั้งคณะ/หน่วยงาน (และชั้นปีถ้าเป็นนิสิต) ได้ครั้งแรกครั้งเดียว หลังจากนั้นให้แอดมินเป็นผู้แก้ไข
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { faculty: true, studentId: true },
  });

  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  if (user.faculty) {
    return new NextResponse("ตั้งค่าคณะ/หน่วยงานไว้แล้ว", { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const result = validateProfileChoice(
    { faculty: body?.faculty, year: body?.year },
    Boolean(user.studentId),
  );

  if (!result.ok) return new NextResponse(result.error, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: {
      faculty: result.faculty,
      ...(result.year !== null && { year: result.year }),
    },
  });

  return NextResponse.json({ faculty: result.faculty, year: result.year });
}
