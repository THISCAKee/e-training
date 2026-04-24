// src/app/admin/page.tsx
"use client"; // 1. เปลี่ยนเป็น Client Component เพื่อจัดการ State ของ Tab

import { useState } from "react";
import { useSession } from "next-auth/react"; // 2. Import useSession
import UserList from "@/components/admin/UserList";
import CourseList from "@/components/admin/CourseList";
import AdminStats from "@/components/admin/AdminStats";
import HeroSliderManagement from "@/components/admin/HeroSliderManagement";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Presentation,
  ChevronRight,
  Settings,
} from "lucide-react";

type Tab = "dashboard" | "users" | "courses" | "slides";

export default function AdminDashboardPage() {
  const { data: session } = useSession(); // 3. ใช้ useSession
  const [activeTab, setActiveTab] = useState<Tab>("dashboard"); // 4. State สำหรับ Tab

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminStats />;
      case "users":
        return <UserList />;
      case "courses":
        return <CourseList />;
      case "slides":
        return <HeroSliderManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 pb-24 pt-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-white mb-4 md:mb-0">
              <div className="flex items-center text-blue-200 text-sm font-medium mb-2 space-x-2">
                <span>ระบบจัดการ</span>
                <ChevronRight size={14} />
                <span className="text-white">แดชบอร์ด</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Admin Dashboard
              </h1>
              <p className="text-blue-100/80 text-lg">
                ยินดีต้อนรับ, {session?.user?.name || "ผู้ดูแลระบบ"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 hover:bg-white/20 transition cursor-pointer">
                <Settings className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16">
        {/* Navigation Cards / Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 flex flex-wrap gap-2 md:flex-nowrap">
          <TabButton
            icon={<LayoutDashboard size={20} />}
            label="ภาพรวมสถิติ"
            subLabel="Overview"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <TabButton
            icon={<Users size={20} />}
            label="จัดการผู้ใช้"
            subLabel="Users"
            isActive={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <TabButton
            icon={<BookOpen size={20} />}
            label="จัดการหลักสูตร"
            subLabel="Courses"
            isActive={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
          />
          {/* <TabButton
            icon={<Presentation size={20} />}
            label="จัดการแบนเนอร์"
            subLabel="Hero Slides"
            isActive={activeTab === "slides"}
            onClick={() => setActiveTab("slides")}
          /> */}
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">{renderTabContent()}</div>
      </div>
    </div>
  );
}

// (Component ย่อยสำหรับปุ่ม Tab)
const TabButton = ({
  label,
  subLabel,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center md:justify-start space-x-3 px-6 py-4 rounded-xl transition-all duration-200
      ${
        isActive
          ? "bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100"
          : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent"
      }
    `}
  >
    <div className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
      {icon}
    </div>
    <div className="text-left hidden sm:block">
      <div
        className={`text-sm font-bold ${isActive ? "text-blue-800" : "text-gray-700"}`}
      >
        {label}
      </div>
      <div
        className={`text-xs ${isActive ? "text-blue-500" : "text-gray-400"}`}
      >
        {subLabel}
      </div>
    </div>
  </button>
);
