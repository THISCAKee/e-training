import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, faculty } = await request.json();

    if (!name || !email || !password || !faculty) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. เช็คว่ามีอีเมล หรือ ชื่อ นี้ในระบบหรือยัง
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { name: name }, // ✅ เพิ่มการเช็คชื่อซ้ำ
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return new NextResponse("อีเมลนี้มีอยู่ในระบบแล้ว", { status: 400 });
      }
      // ✅ เพิ่มเงื่อนไขแจ้งเตือนชื่อซ้ำ
      if (existingUser.name === name) {
        return new NextResponse("ชื่อนี้มีอยู่ในระบบแล้ว", { status: 400 });
      }
    }

    // 3. เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. สร้าง User ใหม่ พร้อมระบุ faculty
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        faculty, // บันทึกสังกัด/คณะ
        role: "USER", // หรือเปลี่ยนเป็น "ADMIN" ถ้าต้องการให้บุคลากรเป็นแอดมินทันที
      },
    });

    return new NextResponse("User registered successfully", { status: 201 });
  } catch (error) {
    console.error("REGISTER_STAFF_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
