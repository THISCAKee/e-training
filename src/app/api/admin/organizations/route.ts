// src/app/api/admin/organizations/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// GET - ดึงรายการหน่วยงานทั้งหมด (Admin เท่านั้น)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    const whereCondition = search
      ? { name: { contains: search } }
      : {};

    const [organizations, totalCount] = await prisma.$transaction([
      prisma.organization.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, courses: true } },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        skip,
        take: pageSize,
      }),
      prisma.organization.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      data: organizations,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("GET_ORGANIZATIONS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST - สร้างหน่วยงานใหม่พร้อมสร้าง User ให้ (Admin เท่านั้น)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, userName, userEmail, userPassword } = body;

    if (!name) {
      return NextResponse.json(
        { message: "ชื่อหน่วยงานจำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    // ตรวจสอบหน่วยงานซ้ำ
    const existingOrg = await prisma.organization.findUnique({
      where: { name },
    });
    if (existingOrg) {
      return NextResponse.json(
        { message: "หน่วยงานนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    // ตรวจสอบ email ซ้ำ (ถ้ามีการสร้าง user ด้วย)
    if (userEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // สร้างหน่วยงาน (และสร้าง User พร้อมกัน ถ้ากรอกข้อมูล)
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        ...(userEmail && userPassword
          ? {
              users: {
                create: {
                  name: userName || name,
                  email: userEmail,
                  password: await bcrypt.hash(userPassword, 12),
                  role: "ORG_ADMIN",
                },
              },
            }
          : {}),
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: { select: { users: true, courses: true } },
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("CREATE_ORGANIZATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
