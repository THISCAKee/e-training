"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  BookOpen,
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
      className="group relative flex flex-col bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <Icon size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
        เข้าสู่หมวดหมู่ <ChevronRight size={18} className="ml-1" />
      </div>
    </Link>
  );
}

export default function HomeModes() {
  const [activeMode, setActiveMode] = useState<
    "training" | "learning" | "podcast"
  >("training");

  return (
    <div className="bg-gray-50/50 py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Mode Selector */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-200/60 transition-all">
            <button
              onClick={() => setActiveMode("training")}
              className={`flex items-center px-8 py-3.5 rounded-full text-lg font-medium transition-all duration-300 ${
                activeMode === "training"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 transform scale-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95"
              }`}
            >
              <BrainCircuit className="mr-2" size={22} />
              AI-Training
            </button>
            <button
              onClick={() => setActiveMode("learning")}
              className={`flex items-center px-8 py-3.5 rounded-full text-lg font-medium transition-all duration-300 ${
                activeMode === "learning"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 transform scale-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95"
              }`}
            >
              <BookOpen className="mr-2" size={22} />
              AI-Learning
            </button>
            <a
              href="http://202.28.34.38/elearning/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-8 py-3.5 rounded-full text-lg font-medium transition-all duration-300 text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95"
            >
              <MonitorPlay className="mr-2" size={22} />
              E-Learning
            </a>
            <button
              onClick={() => setActiveMode("podcast")}
              className={`flex items-center px-8 py-3.5 rounded-full text-lg font-medium transition-all duration-300 ${
                activeMode === "podcast"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 transform scale-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95"
              }`}
            >
              <Podcast className="mr-2" size={22} />
              Podcast
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {/* AI-Training Mode */}
          <div
            className={`transition-all duration-500 transform ${
              activeMode === "training"
                ? "opacity-100 translate-y-0 relative z-10"
                : "opacity-0 absolute translate-y-4 pointer-events-none invisible"
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ฝึกฝนทักษะ AI ของคุณ
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                เลือกหมวดหมู่ที่ตรงกับความสนใจและเป้าหมายของคุณ
                เพื่อเริ่มการเรียนรู้และฝึกฝนการใช้งานเครื่องมือ AI
                อย่างมีประสิทธิภาพ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                : "opacity-0 absolute translate-y-4 pointer-events-none invisible"
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                แหล่งเรียนรู้ AI (AI-Learning)
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                รวบรวมบทความ เทคนิค และเนื้อหาความรู้สำหรับการปรับใช้ AI
                ในระดับมืออาชีพ
              </p>
            </div>

            <div className="bg-white p-16 rounded-3xl text-center border border-gray-100 shadow-sm">
              <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-blue-50 text-blue-500 mb-6">
                <Construction size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                ระบบกำลังอยู่ระหว่างการพัฒนา
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                เนื้อหาของฝั่ง AI-Learning กำลังเตรียมความพร้อม
                เพื่อให้คุณได้รับประสบการณ์การเรียนรู้ที่ดีที่สุด
              </p>
            </div>
          </div>

          {/* Podcast Mode */}
          <div
            className={`transition-all duration-500 transform w-full ${
              activeMode === "podcast"
                ? "opacity-100 translate-y-0 relative z-10"
                : "opacity-0 absolute translate-y-4 pointer-events-none invisible"
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Podcast</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                รับฟังความรู้และแรงบันดาลใจผ่าน Podcast คุณภาพ
              </p>
            </div>

            <div className="bg-white p-16 rounded-3xl text-center border border-gray-100 shadow-sm">
              <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-blue-50 text-blue-500 mb-6">
                <Construction size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                ระบบกำลังอยู่ระหว่างการพัฒนา
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                เนื้อหาของฝั่ง Podcast กำลังเตรียมความพร้อม
                เพื่อให้คุณได้รับประสบการณ์การเรียนรู้ที่ดีที่สุด
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
