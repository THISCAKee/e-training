// src/components/admin/UserList.tsx (ฉบับอัปเกรด)
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import Link from "next/link";

type User = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  studentId: string | null;
  faculty: string | null;
};

// (Component นี้จะถูกเรียกใช้ใน page.tsx)
export default function UserList() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Pagination and Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input to allow smooth free-text typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search);
        setCurrentPage(1); // Reset to page 1 on new search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const fetchUsers = async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&pageSize=10&search=${searchTerm}`,
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  // 3. ฟังก์ชันสำหรับเปลี่ยน Role
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");

      // อัปเดต state เพื่อให้ UI เปลี่ยนทันที
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // 4. ฟังก์ชันสำหรับลบผู้ใช้
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete user");
        }

        // อัปเดต state โดยการกรอง user ที่ถูกลบออกไป
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        alert(err instanceof Error ? err.message : "An error occurred");
      }
    }
  };

  if (loading && users.length === 0)
    return (
      <div className="text-gray-500 py-8 text-center">Loading users...</div>
    );
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          User Management
        </h2>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 text-gray-700">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล หรือรหัสนิสิต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full bg-white text-black">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b text-left font-medium">Name</th>
              <th className="py-3 px-4 border-b text-left font-medium">
                Email
              </th>
              <th className="py-3 px-4 border-b text-left font-medium">
                Student ID
              </th>
              <th className="py-3 px-4 border-b text-left font-medium">
                Faculty
              </th>
              <th className="py-3 px-4 border-b text-center font-medium">
                Role
              </th>
              <th className="py-3 px-4 border-b text-center font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && users.length > 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">
                      ไม่พบผู้ใช้งานที่ค้นหา
                    </p>
                    <p className="text-sm">ลองเปลี่ยนคำค้นหาใหม่</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-semibold">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {user.name || "Unknown"}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.studentId || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.faculty || "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  {/* --- vvvv (เพิ่ม) นำคอลัมน์ Actions กลับมา vvvv --- */}
                  <td className="py-3 px-4 text-center">
                    {/* ปุ่มจะถูก disable ถ้าเป็นแถวของ Admin ที่ login อยู่ */}
                    {session?.user?.id !== user.id.toString() ? (
                      <div className="flex items-center justify-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="text-xs p-1.5 border border-gray-300 rounded-md outline-none focus:border-blue-500 text-gray-700 bg-white cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <Link
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteUser(user.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          href={""}
                        >
                          Delete
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        (Current Admin)
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4">
        <span>
          ข้อมูลทั้งหมด{" "}
          <span className="font-bold text-gray-900">{totalCount}</span> รายการ
        </span>
        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors border border-gray-200 shadow-sm"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2 font-medium">
            หน้า {currentPage} จาก {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading || totalPages === 0}
            className="px-4 py-2 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors border border-gray-200 shadow-sm"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
