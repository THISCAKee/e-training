// src/app/page.tsx (ฉบับแก้ไข: ใช้รูปภาพเป็นพื้นหลัง Hero)

import type { Course } from "@/data/courses";
import HeroCarousel from "@/components/HeroCarousel";
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
      <HeroCarousel />
      <HomeModes />

      {/* Recent Courses Section (ย้ายออกมาอยู่นอกสุด) */}
      <div className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              หลักสูตรแนะนำ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              เริ่มต้นเส้นทางการเรียนรู้ AI
              ของคุณด้วยหลักสูตรที่ได้รับความนิยมและมีคุณภาพครอบคลุมทุกระดับตั้งแต่พื้นฐานจนถึงขั้นสูง
            </p>
          </div>

          {recentCourses && recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
              <p className="text-xl text-gray-500 font-medium">
                ยังไม่มีหลักสูตรในขณะนี้
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center bg-gray-900 text-white font-medium px-8 py-3.5 rounded-full hover:bg-gray-800 transition-colors duration-300 hover:shadow-lg"
            >
              ดูหลักสูตรทั้งหมด <ChevronRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
