// src/app/courses/page.tsx (ฉบับใหม่)

import CourseCard from "@/components/CourseCard";
import type { Course } from "@/data/courses"; // เรายังใช้ Type เดิมได้
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ฟังก์ชันสำหรับดึงข้อมูลจาก API ของเรา
async function getCourses(): Promise<Course[]> {
  return prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
    },
  });
}

export default async function CoursesPage() {
  const allCourses = await getCourses();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          หลักสูตรทั้งหมด
        </h1>

        {allCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-black">ยังไม่มีหลักสูตรในขณะนี้</p>
        )}
      </div>
    </div>
  );
}
