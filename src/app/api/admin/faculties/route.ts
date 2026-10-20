import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFacultyOptions } from "@/lib/faculty-options";

export async function GET() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const facultyList = await getFacultyOptions();

    return NextResponse.json(facultyList, { status: 200 });
  } catch (error) {
    console.error("GET_FACULTIES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
