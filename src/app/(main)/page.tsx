// src/app/page.tsx (ฉบับแก้ไข: ใช้รูปภาพเป็นพื้นหลัง Hero)

import CourseCard from "@/components/CourseCard";
import type { Course } from "@/data/courses";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import { BrainCircuit, HeartHandshake, FlaskConical } from "lucide-react";
// (เราจะไม่ใช้ <Image> ในส่วนนี้ จะใช้ CSS background แทน)

async function getRecentCourses(): Promise<Course[]> {
  try {
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
  // (Component ย่อยสำหรับ Category Card)
  const CategoryCard = ({
    title,
    description,
    theme,
    // icon,
    href,
  }: {
    title: string;
    description: string;
    theme: string;
    // icon: React.ReactNode;
    href: string;
  }) => (
    <Link
      href={href}
      className="block bg-white p-6 rounded-lg shadow-lg  hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="text-center space-x-4 mb-3">
        {/*<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>*/}
        <h1 className="text-6xl font-bold text-gray-800">{theme}</h1>
      </div>
      <div className="text-center space-x-4 mb-3">
        {/*<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>*/}
        <p className="text-2xl font-normal text-gray-800">{title}</p>
      </div>
      <p className="text-center text-gray-600">{description}</p>
    </Link>
  );

  return (
    <>
      {/* --- vvvv Hero Section (แก้ไขใหม่ทั้งหมด) vvvv --- */}
      <HeroCarousel />
      <div className="bg-white py-16 j">
        {" "}
        {/* ใช้พื้นหลังสีขาว หรือสีอ่อนๆ */}
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-medium text-center text-gray-800 mb-8">
            CATEGORY
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <CategoryCard
              theme="C"
              title="AI For Creative"
              description="เครื่องมือ AI สำหรับงานสร้างสรรค์และออกแบบ"
              // icon={<BrainCircuit size={28} className="text-blue-600" />}
              href="/category/AI For Creative" // <-- ลิงก์ไปยัง Category "Creative"
            />
            <CategoryCard
              theme="L"
              title="AI For Life"
              description="การประยุกต์ใช้ AI ในชีวิตประจำวันและสังคม"
              // icon={<HeartHandshake size={28} className="text-blue-600" />}
              href="/category/AI ForLife" // <-- ลิงก์ไปยัง Category "Life"
            />
            <CategoryCard
              theme="R"
              title="AI For Research"
              description="AI สำหรับการวิจัย การวิเคราะห์ข้อมูลขั้นสูง"
              // icon={<FlaskConical size={28} className="text-blue-600" />}
              href="/category/AI For Research" // <-- ลิงก์ไปยัง Category "Research"
            />
          </div>
        </div>
      </div>

      {/* Recent Courses Section (ส่วนนี้เหมือนเดิม) */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semiboldbold text-center text-gray-800 mb-8">
            หลักสูตรแนะนำ
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
              className="bg-blue-600 text-white font-normal px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300"
            >
              ดูหลักสูตรทั้งหมด
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
