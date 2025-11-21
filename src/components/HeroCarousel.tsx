// src/components/HeroCarousel.tsx
"use client";

import Link from "next/link";

export default function HeroCarousel() {
  return (
    <div className="relative h-[60vh] text-white overflow-hidden">
      {/* Video พื้นหลัง */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        {/* Fallback: ถ้าเบราว์เซอร์ไม่รองรับ video */}
        Your browser does not support the video tag.
      </video>

      {/* Overlay สีดำ (ปรับ opacity ได้ตามต้องการ) */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* เนื้อหาข้อความ */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 drop-shadow-lg">
          พลิกโฉมการเรียนรู้ <br /> สู่โลกดิจิทัล
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-200 max-w-2xl drop-shadow-md">
          แพลตฟอร์มที่จะช่วยพัฒนาทักษะของคุณให้พร้อมสำหรับอนาคต
        </p>
        <Link
          href="/courses"
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-md transition duration-300 shadow-lg"
        >
          เริ่มเรียนเลย
        </Link>
      </div>
    </div>
  );
}
