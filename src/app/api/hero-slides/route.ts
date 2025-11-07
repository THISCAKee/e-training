// src/app/api/hero-slides/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic"; // ให้ข้อมูลอัปเดตเสมอ

export async function GET(request: Request) {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: {
        isActive: true, // เอาเฉพาะสไลด์ที่เปิดใช้งาน
      },
      orderBy: {
        order: "asc", // เรียงตามลำดับที่กำหนด
      },
    });
    return NextResponse.json(slides);
  } catch (error) {
    console.error("GET_HERO_SLIDES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
