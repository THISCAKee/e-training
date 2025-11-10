// src/app/api/admin/categories/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    // หมายเหตุ: เราไม่ได้ส่งแบบ { data: ... } เพราะหน้านี้ไม่ต้องมี Pagination
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET_CATEGORIES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// (Optional) คุณสามารถเพิ่ม POST function ที่นี่ในอนาคต
// สำหรับสร้าง Category ใหม่จากหน้า "Manage Categories"
