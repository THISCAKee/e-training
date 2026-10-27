import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { parsePodcastInput } from "@/lib/podcasts/input";

type Context = { params: Promise<{ id: string }> };

function parseId(id: string) {
  return /^[1-9]\d*$/.test(id) && Number(id) <= 2147483647 ? Number(id) : null;
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "รหัส Podcast ไม่ถูกต้อง" }, { status: 400 });
  let data;
  try {
    data = parsePodcastInput(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    // updateMany avoids throwing for an episode deleted in another session.
    const result = await prisma.podcast.updateMany({ where: { id }, data });
    if (!result.count) return NextResponse.json({ error: "ไม่พบ Podcast นี้" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE_PODCAST_ERROR", error);
    return NextResponse.json({ error: "ไม่สามารถแก้ไข Podcast ได้ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "รหัส Podcast ไม่ถูกต้อง" }, { status: 400 });
  try {
    const result = await prisma.podcast.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: "ไม่พบ Podcast นี้" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_PODCAST_ERROR", error);
    return NextResponse.json({ error: "ไม่สามารถลบ Podcast ได้ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
