// src/app/page.tsx (ฉบับแก้ไข: ใช้รูปภาพเป็นพื้นหลัง Hero)

import type { Course } from "@/data/courses";
import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";
import HomeModes from "@/components/HomeModes";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getRecentCourses(): Promise<Course[]> {
  try {
    return await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        category: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const recentCourses = await getRecentCourses();

  return (
    <>
      <PerspectiveTunnelHero courses={recentCourses.map(({ id, title, imageUrl }) => ({ id, title, imageUrl }))} />
      <HomeModes />

      {/* Recent Courses Section (ย้ายออกมาอยู่นอกสุด) */}
      <div className="bg-gray-50 border-t border-gray-200 py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">
              หลักสูตรแนะนำ
            </h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              เริ่มต้นเส้นทางการเรียนรู้ AI
              ของคุณด้วยหลักสูตรที่ได้รับความนิยมและมีคุณภาพครอบคลุมทุกระดับตั้งแต่พื้นฐานจนถึงขั้นสูง
            </p>
          </div>

          {recentCourses && recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl text-center border border-gray-200">
              <p className="text-gray-500">
                ยังไม่มีหลักสูตรในขณะนี้
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center border border-gray-900 text-gray-900 text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-colors duration-200"
            >
              ดูหลักสูตรทั้งหมด <ChevronRight className="ml-1.5" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
