// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลจาก request body
    const body = await request.json();
    const {
      email,
      name,
      password,
      studentId, // <-- เพิ่ม
      faculty, // <-- เพิ่ม
      program, // <-- เพิ่ม
      major, // <-- เพิ่ม
      year,
    } = body;

    // 2. ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (
      !email ||
      !name ||
      !password ||
      !studentId ||
      !faculty ||
      !program ||
      !major ||
      !year
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    if (studentId) {
      // ตรวจสอบถ้ามี studentId ส่งมา
      const existingUserByStudentId = await prisma.user.findUnique({
        where: { studentId: studentId },
      });
      if (existingUserByStudentId) {
        return new NextResponse("User with this student ID already exists", {
          status: 409,
        });
      }
    }
    // 3. ตรวจสอบว่ามี email นี้ในระบบแล้วหรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

    // 4. เข้ารหัสรหัสผ่าน (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. สร้างผู้ใช้ใหม่ในฐานข้อมูล
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        studentId, // <-- เพิ่ม
        faculty, // <-- เพิ่ม
        program, // <-- เพิ่ม
        major, // <-- เพิ่ม
        year,
      },
    });

    // 6. ส่งข้อมูลผู้ใช้ใหม่กลับไป (โดยไม่ส่งรหัสผ่าน)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    // (Optional) เพิ่มการตรวจสอบ Error ที่เฉพาะเจาะจงมากขึ้น
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return new NextResponse("Email or Student ID already exists", {
        status: 409,
      });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
