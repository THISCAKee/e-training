// src/app/admin/page.tsx
"use client"; // 1. เปลี่ยนเป็น Client Component เพื่อจัดการ State ของ Tab

import { useState } from "react";
import { auth } from "@/auth"; // (auth ใช้ใน Server Component, เราจะใช้ useSession แทน)
import { useSession } from "next-auth/react"; // 2. Import useSession
import UserList from "@/components/admin/UserList";
import CourseList from "@/components/admin/CourseList";
import AdminStats from "@/components/admin/AdminStats"; // (Import component ใหม่)
import { LayoutDashboard, Users, BookOpen } from "lucide-react"; // (Import icons)

type Tab = "dashboard" | "users" | "courses";

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
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 text-black">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg mb-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {session?.user?.name}.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b border-gray-300">
          <TabButton
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            isActive={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <TabButton
            icon={<Users size={18} />}
            label="Manage Users"
            isActive={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <TabButton
            icon={<BookOpen size={18} />}
            label="Manage Courses"
            isActive={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 p-4 md:p-8 rounded-lg min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
}

// (Component ย่อยสำหรับปุ่ม Tab)
const TabButton = ({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm
      ${
        isActive
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);
