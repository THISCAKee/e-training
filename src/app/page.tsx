// src/app/page.tsx (ฉบับแก้ไข: ใช้รูปภาพเป็นพื้นหลัง Hero)

import CourseCard from "@/components/CourseCard";
import type { Course } from "@/data/courses";
import Link from "next/link";
// (เราจะไม่ใช้ <Image> ในส่วนนี้ จะใช้ CSS background แทน)

async function getRecentCourses(): Promise<Course[]> {
  // ... (ฟังก์ชันนี้เหมือนเดิม) ...
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/courses`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const allCourses = await res.json();
    return allCourses.slice(0, 4); // เอาแค่ 4 รายการล่าสุด
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
      <div
        className="relative text-center opacity-95 h-[60vh]" // 2. ใช้ relative เพื่อให้ Overlay ลอยทับได้
        style={{
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-30 flex items-center justify-center"></div>

        {/* 4. ส่วนของเนื้อหา (ต้องใช้ relative z-10 เพื่อให้ลอยอยู่เหนือ Overlay) */}
        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10 justify items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            พลิกโฉมการเรียนรู้ <br /> สู่โลกดิจิทัล
          </h1>
          <p className="mt-10 text-3xl text-gray-200">
            แพลตฟอร์มที่จะช่วยพัฒนาทักษะของคุณให้พร้อมสำหรับอนาคต
          </p>
        </div>
      </div>
      {/* --- ^^^^ สิ้นสุด Hero Section ^^^^ --- */}

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
