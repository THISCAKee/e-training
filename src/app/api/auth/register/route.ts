import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, studentId, faculty, major, program, year } =
      body;

    if (!name || !email || !password || !studentId || !faculty) {
      return new NextResponse("กรุณากรอกข้อมูลให้ครบถ้วน", { status: 400 });
    }

    // 1. เช็คว่ามีข้อมูลซ้ำในระบบหรือไม่ (Email, Student ID, หรือ Name)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { studentId: studentId },
          { name: name }, // ✅ เพิ่มการเช็คชื่อ
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return new NextResponse("มีอีเมลอยู่ในระบบแล้ว", { status: 400 });
      }
      if (existingUser.studentId === studentId) {
        return new NextResponse("มีรหัสนิสิตอยู่ในระบบแล้ว", { status: 400 });
      }
      // ✅ เพิ่มเงื่อนไขแจ้งเตือนชื่อซ้ำ
      if (existingUser.name === name) {
        return new NextResponse("มีชื่ออยู่ในระบบแล้ว", { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        studentId,
        faculty,
        major,
        program,
        year: year ? parseInt(year) : null,
      },
    });

    return new NextResponse("User registered successfully", { status: 201 });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
