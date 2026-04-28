// src/app/admin/page.tsx
"use client"; // 1. เปลี่ยนเป็น Client Component เพื่อจัดการ State ของ Tab

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 2. Import useSession
import { useRouter } from "next/navigation";
import UserList from "@/components/admin/UserList";
import CourseList from "@/components/admin/CourseList";
import AdminStats from "@/components/admin/AdminStats";
import HeroSliderManagement from "@/components/admin/HeroSliderManagement";
import OrganizationList from "@/components/admin/OrganizationList";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Presentation,
  ChevronRight,
  Settings,
  Building2,
  ShieldAlert,
} from "lucide-react";

type Tab = "dashboard" | "users" | "courses" | "slides" | "organizations";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession(); // 3. ใช้ useSession
  const router = useRouter();
  const userRole = session?.user?.role;
  const isOrgAdmin = userRole === "ORG_ADMIN";
  const isAdmin = userRole === "ADMIN";

  // ORG_ADMIN เริ่มที่แท็บ courses เลย, ADMIN เริ่มที่ dashboard
  const [activeTab, setActiveTab] = useState<Tab>(isOrgAdmin ? "courses" : "dashboard");

  // ตรวจสอบสิทธิ์: ถ้าไม่ใช่ ADMIN หรือ ORG_ADMIN ให้ redirect กลับหน้าหลัก
  useEffect(() => {
    if (status === "loading") return; // รอให้ session โหลดเสร็จ
    if (!session?.user || (userRole !== "ADMIN" && userRole !== "ORG_ADMIN")) {
      router.push("/");
    }
  }, [session, status, userRole, router]);

  // อัปเดต default tab เมื่อ role โหลดเสร็จ
  useEffect(() => {
    if (isOrgAdmin) {
      setActiveTab("courses");
    }
  }, [isOrgAdmin]);

  // แสดง Loading ขณะตรวจสอบ session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // ถ้าไม่มีสิทธิ์ แสดงหน้า Access Denied
  if (!isAdmin && !isOrgAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3 text-center">
          <ShieldAlert className="w-16 h-16 text-red-400" />
          <h2 className="text-xl font-bold text-gray-800">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-500">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminStats />;
      case "users":
        return isAdmin ? <UserList /> : null;
      case "courses":
        return <CourseList />;
      case "organizations":
        return isAdmin ? <OrganizationList /> : null;
      case "slides":
        return isAdmin ? <HeroSliderManagement /> : null;
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
                {isOrgAdmin && (
                  <>
                    <ChevronRight size={14} />
                    <span className="text-yellow-300 font-semibold">หน่วยงาน</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {isOrgAdmin ? "Organization Dashboard" : "Admin Dashboard"}
              </h1>
              <p className="text-blue-100/80 text-lg">
                ยินดีต้อนรับ, {session?.user?.name || "ผู้ดูแลระบบ"}
                {isOrgAdmin && (
                  <span className="ml-2 inline-flex items-center bg-yellow-400/20 text-yellow-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-400/30">
                    ผู้ดูแลหน่วยงาน
                  </span>
                )}
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
          {/* ORG_ADMIN แสดงเฉพาะ Dashboard + Courses */}
          <TabButton
            icon={<LayoutDashboard size={20} />}
            label="ภาพรวมสถิติ"
            subLabel="Overview"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          {isAdmin && (
            <TabButton
              icon={<Users size={20} />}
              label="จัดการผู้ใช้"
              subLabel="Users"
              isActive={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            />
          )}
          <TabButton
            icon={<BookOpen size={20} />}
            label="จัดการหลักสูตร"
            subLabel="Courses"
            isActive={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
          />
          {isAdmin && (
            <TabButton
              icon={<Building2 size={20} />}
              label="จัดการหน่วยงาน"
              subLabel="Organizations"
              isActive={activeTab === "organizations"}
              onClick={() => setActiveTab("organizations")}
            />
          )}
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
