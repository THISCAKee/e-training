"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  ChevronRight,
  PenTool,
  Lightbulb,
  FlaskConical,
  Construction,
  MonitorPlay,
  Podcast,
  type LucideIcon,
} from "lucide-react";

type CategoryCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

function CategoryCard({
  title,
  description,
  icon: Icon,
  href,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col bg-white p-7 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors duration-200"
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} strokeWidth={1.5} className="text-gray-900" />
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-500 leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      <div className="flex items-center text-sm text-gray-900 font-medium">
        เข้าสู่หมวดหมู่ <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function HomeModes() {
  const [activeMode, setActiveMode] = useState<
    "training" | "learning"
  >("training");

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Mode Selector */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-wrap justify-center gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveMode("training")}
              className={`-mb-px flex items-center justify-center border-b-2 px-4 py-3 text-sm sm:px-6 sm:text-base font-medium transition-colors duration-200 ${
                activeMode === "training"
                  ? "border-[#f77f00] text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <BrainCircuit className="mr-2" size={18} strokeWidth={1.75} />
              AI-Training
            </button>
            <Link
              href="/podcasts"
              className="-mb-px flex items-center justify-center border-b-2 border-transparent px-4 py-3 text-sm sm:px-6 sm:text-base font-medium transition-colors duration-200 text-gray-500 hover:text-gray-900"
            >
              <Podcast className="mr-2" size={18} strokeWidth={1.75} />
              Podcast
            </Link>
            <a
              href="http://202.28.34.38/elearning/"
              target="_blank"
              rel="noopener noreferrer"
              className="-mb-px flex items-center justify-center border-b-2 border-transparent px-4 py-3 text-sm sm:px-6 sm:text-base font-medium transition-colors duration-200 text-gray-500 hover:text-gray-900"
            >
              <MonitorPlay className="mr-2" size={18} strokeWidth={1.75} />
              E-Learning
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          {/* AI-Training Mode */}
          <div
            className={`transition-all duration-500 transform ${
              activeMode === "training"
                ? "opacity-100 translate-y-0 relative z-10"
                : "opacity-0 absolute inset-x-0 top-0 translate-y-4 pointer-events-none invisible"
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">
                ฝึกฝนทักษะ AI ของคุณ
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                เลือกหมวดหมู่ที่ตรงกับความสนใจและเป้าหมายของคุณ
                เพื่อเริ่มการเรียนรู้และฝึกฝนการใช้งานเครื่องมือ AI
                อย่างมีประสิทธิภาพ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CategoryCard
                title="AI For Creative"
                description="ปลดล็อกจินตนาการด้วยเครื่องมือ AI สำหรับงานสร้างสรรค์และออกแบบ สร้างสรรค์ผลงานศิลปะ บทความ และวิดีโอได้อย่างไร้ขีดจำกัด"
                icon={PenTool}
                href="/category/AI For Creative"
              />
              <CategoryCard
                title="AI For Life"
                description="ยกระดับคุณภาพชีวิตด้วยการประยุกต์ใช้ AI ในชีวิตประจำวันและสังคม เพิ่มประสิทธิภาพการทำงานและการจัดการเวลา"
                icon={Lightbulb}
                href="/category/AI For Life"
              />
              <CategoryCard
                title="AI For Research"
                description="เพิ่มศักยภาพการวิจัยด้วย AI สำหรับการวิเคราะห์ข้อมูลขั้นสูง การประมวลผลภาษาธรรมชาติ และการค้นคว้าทางวิทยาศาสตร์"
                icon={FlaskConical}
                href="/category/AI For Research"
              />
            </div>
          </div>

          {/* AI-Learning Mode */}
          <div
            className={`transition-all duration-500 transform w-full ${
              activeMode === "learning"
                ? "opacity-100 translate-y-0 relative z-10"
                : "opacity-0 absolute inset-x-0 top-0 translate-y-4 pointer-events-none invisible"
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-3">
                แหล่งเรียนรู้ AI (AI-Learning)
              </h2>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                รวบรวมบทความ เทคนิค และเนื้อหาความรู้สำหรับการปรับใช้ AI
                ในระดับมืออาชีพ
              </p>
            </div>

            <div className="p-16 rounded-xl text-center border border-gray-200">
              <Construction size={32} strokeWidth={1.5} className="mx-auto mb-5 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ระบบกำลังอยู่ระหว่างการพัฒนา
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                เนื้อหาของฝั่ง AI-Learning กำลังเตรียมความพร้อม
                เพื่อให้คุณได้รับประสบการณ์การเรียนรู้ที่ดีที่สุด
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
