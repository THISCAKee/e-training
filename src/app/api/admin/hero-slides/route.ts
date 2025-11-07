// src/app/api/admin/hero-slides/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET (รองรับ Pagination/Search เหมือน Admin อื่นๆ)
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    // (ข้าม Pagination ก่อนเพื่อความง่าย)

    const slides = await prisma.heroSlide.findMany({
      where: {
        title: { contains: search },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: slides, totalCount: slides.length }); // ส่งในรูปแบบ data
  } catch (error) {
    console.error("GET_ADMIN_SLIDES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST (สร้างสไลด์ใหม่)
export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, imageUrl, linkUrl, order, isActive } = body;

    if (!title || !imageUrl || !linkUrl) {
      return new NextResponse("Title, Image URL, and Link URL are required", {
        status: 400,
      });
    }

    const newSlide = await prisma.heroSlide.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        order: order ? parseInt(order) : 0,
        isActive: isActive,
      },
    });
    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error("CREATE_SLIDE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
