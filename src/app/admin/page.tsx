// src/app/admin/page.tsx (ฉบับแก้ไข)

import { auth } from "@/auth";
import UserList from "@/components/admin/UserList"; // 1. Import Component
import CourseList from "@/components/admin/CourseList";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="container mx-auto py-8 text-black">
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {session?.user?.name}. You have special privileges.
        </p>
      </div>

      {/* 2. เรียกใช้งาน UserList Component */}
      <UserList />
      <CourseList />
    </div>
  );
}
