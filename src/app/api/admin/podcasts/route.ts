import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { parsePodcastInput } from "@/lib/podcasts/input";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  try {
    const data = await prisma.podcast.findMany({ orderBy: [{ order: "asc" }, { id: "desc" }] });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("LIST_PODCASTS_ERROR", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายการ Podcast ได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  let data;
  try {
    data = parsePodcastInput(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    const podcast = await prisma.podcast.create({ data });
    return NextResponse.json(podcast, { status: 201 });
  } catch (error) {
    console.error("CREATE_PODCAST_ERROR", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึก Podcast ได้ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
