// src/components/admin/UserList.tsx (ฉบับอัปเกรด)
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 1. Import useSession เพื่อใช้ id ของ admin

type User = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function UserList() {
  const { data: session } = useSession(); // 2. ดึงข้อมูล session ของ admin ที่ login อยู่
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... useEffect สำหรับ fetchUsers (เหมือนเดิม) ...
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              {/* ... th (เหมือนเดิม) ... */}
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                {/* ... td (เหมือนเดิม) ... */}
                <td className="py-2 px-4 border-b text-center">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b text-center">
                  {/* ... span แสดง role (เหมือนเดิม) ... */}
                  {user.role}
                </td>

                {/* 5. เพิ่มคอลัมน์ Actions พร้อมปุ่ม */}
                <td className="py-2 px-4 border-b text-center">
                  {/* ปุ่มจะถูก disable ถ้าเป็นแถวของ Admin ที่ login อยู่ */}
                  {session?.user?.id !== user.id.toString() && (
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
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 text-xs p-1 bg-red-100 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
