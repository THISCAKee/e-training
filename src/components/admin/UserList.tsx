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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&pageSize=10&search=${searchTerm}`
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
    fetchUsers(currentPage, search);
  }, [currentPage, search]);

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
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
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

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">User Management</h2>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Student ID</th>
              <th className="py-2 px-4 border-b text-left">Faculty</th>
              <th className="py-2 px-4 border-b text-center">Role</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">
                    {user.studentId || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">{user.faculty || "-"}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {user.role}
                  </td>
                  {/* --- vvvv (เพิ่ม) นำคอลัมน์ Actions กลับมา vvvv --- */}
                  <td className="py-2 px-4 border-b text-center">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {user.name || "No Name"}
                    </Link>
                    {/* ปุ่มจะถูก disable ถ้าเป็นแถวของ Admin ที่ login อยู่ */}
                    {session?.user?.id !== user.id.toString() ? (
                      <div className="flex justify-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="text-xs p-1 border rounded"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <Link
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 text-xs p-1 bg-red-100 rounded"
                          href={""}
                        >
                          Delete
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
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
      <div className="mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-600">Total {totalCount} users</span>
        <div className="flex space-x-2">
          <Link
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            // disabled={currentPage === 1 || loading}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md disabled:opacity-50"
            href={""}
          >
            Previous
          </Link>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            // disabled={currentPage === totalPages || loading}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md disabled:opacity-50"
            href={""}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
