// src/app/page.tsx (ฉบับแก้ไข: ใช้รูปภาพเป็นพื้นหลัง Hero)

import CourseCard from "@/components/CourseCard";
import type { Course } from "@/data/courses";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
// (เราจะไม่ใช้ <Image> ในส่วนนี้ จะใช้ CSS background แทน)

async function getRecentCourses(): Promise<Course[]> {
  try {
    // --- vvvv แก้ไขตรงนี้ vvvv ---

    // 1. เรียก API โดยระบุว่าต้องการแค่ 4 รายการ (หน้า 1, ขนาด 4)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/courses`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) return [];

    // 2. รับข้อมูลเป็น Object
    const responseData = await res.json();

    // 3. คืนค่าเฉพาะ Array ที่อยู่ใน .data
    return responseData.data;

    // --- ^^^^ สิ้นสุดการแก้ไข ^^^^ ---
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const recentCourses = await getRecentCourses();

  // 1. นี่คือลิงก์รูปภาพโดยตรงจาก Unsplash ID (trJEbYWZ_Z4) ที่คุณให้มา
  const heroImageUrl = "/bg-hero.jpg";

  return (
    <>
      {/* --- vvvv Hero Section (แก้ไขใหม่ทั้งหมด) vvvv --- */}
      <HeroCarousel />

      {/* Recent Courses Section (ส่วนนี้เหมือนเดิม) */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            หลักสูตรล่าสุด
          </h2>
          {recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              ยังไม่มีหลักสูตรในขณะนี้
            </p>
          )}
          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300"
            >
              ดูหลักสูตรทั้งหมด
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
