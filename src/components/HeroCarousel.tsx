// src/components/HeroCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";

// import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";

// Type สำหรับสไลด์
type Slide = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/hero-slides");
        if (!res.ok) throw new Error("Failed to fetch slides");
        const data = await res.json();
        setSlides(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  if (loading) {
    return (
      <div className="relative text-center opacity-95 h-[60vh] bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading Slides...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    // ถ้าไม่มีสไลด์เลย ให้กลับไปแสดง Hero แบบเดิม (หรือไม่แสดงอะไรเลย)
    return (
      <div
        className="relative text-center opacity-95 h-[60vh]"
        style={{
          backgroundImage: `url('/bg-hero.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-30 flex items-center justify-center"></div>
        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10 justify items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            พลิกโฉมการเรียนรู้ <br /> สู่โลกดิจิทัล
          </h1>
          <p className="mt-10 text-3xl text-gray-200">
            แพลตฟอร์มที่จะช่วยพัฒนาทักษะของคุณให้พร้อมสำหรับอนาคต
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[60vh] text-white">
      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        pagination={{ clickable: true }}
        navigation={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            {/* 1. รูปภาพพื้นหลัง */}
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              {/* 2. Overlay สีดำ */}
              <div className="absolute inset-0 bg-black opacity-40"></div>
            </div>

            {/* 3. เนื้อหาข้อความ */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="mt-4 text-2xl text-gray-200 max-w-2xl">
                  {slide.subtitle}
                </p>
              )}
              <Link
                href={slide.linkUrl}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-md transition duration-300"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
