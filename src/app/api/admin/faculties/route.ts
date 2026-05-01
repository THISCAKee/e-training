import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const PREDEFINED_FACULTIES = [
  "คณะวิทยาศาสตร์",
  "คณะเทคโนโลยี",
  "คณะวิศวกรรมศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์ผังเมืองและนฤมิตศิลป์",
  "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์",
  "คณะวิทยาการสารสนเทศ",
  "คณะพยาบาลศาสตร์",
  "คณะเภสัชศาสตร์",
  "คณะสาธารณสุขศาสตร์",
  "คณะแพทยศาสตร์",
  "คณะสัตวแพทยศาสตร์",
  "คณะมนุษยศาสตร์และสังคมศาสตร์",
  "คณะศึกษาศาสตร์",
  "คณะการบัญชีและการจัดการ",
  "คณะศิลปกรรมศาสตร์และวัฒนธรรมศาสตร์",
  "คณะการท่องเที่ยวและการโรงแรม",
  "วิทยาลัยการเมืองการปกครอง",
  "คณะนิติศาสตร์",
  "วิทยาลัยดุริยางคศิลป์",
];

export async function GET() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const faculties = await prisma.user.findMany({
      select: {
        faculty: true,
      },
      where: {
        faculty: {
          not: null,
        },
      },
      distinct: ["faculty"],
    });

    const dbFaculties = faculties
      .map((f) => f.faculty)
      .filter(Boolean) as string[];

    // รวมรายชื่อคณะที่ดึงมาจากฐานข้อมูลและรายชื่อเริ่มต้น จากนั้นตัดตัวซ้ำออก
    const facultySet = new Set([...PREDEFINED_FACULTIES, ...dbFaculties]);
    const facultyList = Array.from(facultySet).sort();

    return NextResponse.json(facultyList, { status: 200 });
  } catch (error) {
    console.error("GET_FACULTIES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
