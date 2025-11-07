// src/app/api/admin/hero-slides/[id]/route.ts
// Admin API - สำหรับแก้ไขและลบ Hero Slide แต่ละอัน

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET - ดึงข้อมูล slide เดี่ยว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params; // ต้อง await params ก่อน
    const slide = await prisma.heroSlide.findUnique({
      where: { id: parseInt(id) },
    });

    if (!slide) {
      return new NextResponse("Slide not found", { status: 404 });
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error("GET_SLIDE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH - แก้ไข slide
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params; // ต้อง await params ก่อน
    const body = await request.json();
    const { title, subtitle, imageUrl, linkUrl, order, isActive } = body;

    const updatedSlide = await prisma.heroSlide.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(imageUrl && { imageUrl }),
        ...(linkUrl && { linkUrl }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error("UPDATE_SLIDE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE - ลบ slide
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params; // ต้อง await params ก่อน
    await prisma.heroSlide.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_SLIDE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
