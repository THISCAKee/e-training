// src/app/category/[categoryName]/page.tsx

import CourseCard from "@/components/CourseCard";
import type { Course } from "@/data/courses"; // ใช้ Type เดิม
import { notFound } from "next/navigation";

// (แก้ปัญหา Next.js 15+)
interface CategoryPageProps {
  params: Promise<{
    categoryName: string;
  }>;
}

// ฟังก์ชันสำหรับดึงข้อมูลคอร์สที่กรองแล้ว
async function getFilteredCourses(categoryName: string): Promise<Course[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/category/${categoryName}`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      throw new Error("Failed to fetch courses for this category");
    }
    return res.json();
  } catch (error) {
    console.error("GET_FILTERED_COURSES_ERROR", error);
    return []; // คืนค่า Array ว่างถ้า Error
  }
}

export default async function CategoryPage(
  contextPromise: Promise<CategoryPageProps>,
) {
  const { params } = await contextPromise;
  const resolvedParams = await params; // await params อีกครั้ง
  const categoryName = decodeURIComponent(resolvedParams.categoryName);

  const filteredCourses = await getFilteredCourses(categoryName);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12 justify-items-center">
        <h1 className="text-4xl font-semiboldbold text-gray-800 mb-10">
          AI For {categoryName}
        </h1>
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            ไม่พบหลักสูตรในหมวดหมู่นี้
          </p>
        )}
      </div>
    </div>
  );
}
