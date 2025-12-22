"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, KeyRound } from "lucide-react";

type Enrollment = {
  id: number;
  status: string;
  enrolledAt: string;
  course: {
    id: number;
    title: string;
  };
};

type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: string;
  studentId: string | null;
  faculty: string | null;
  major: string | null;
  year: string | null;
  enrollments: Enrollment[];
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  // เพิ่ม State สำหรับจัดการรหัสผ่านใหม่
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ดึงข้อมูล User
  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error(error);
      alert("Error loading user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  // ฟังก์ชันลบคอร์ส
  const handleRemoveCourse = async (enrollmentId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าจะยกเลิกคอร์สเรียนนี้ของผู้ใช้?")) return;

    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("ลบคอร์สเรียบร้อยแล้ว");
        fetchUser(); // โหลดข้อมูลใหม่
      } else {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  // เพิ่มฟังก์ชันเปลี่ยนรหัสผ่าน
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (!confirm("ยืนยันการเปลี่ยนรหัสผ่านให้ผู้ใช้นี้?")) return;

    try {
      const res = await fetch(`/api/admin/users/${params.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        alert("เปลี่ยนรหัสผ่านสำเร็จ!");
        setNewPassword(""); // ล้างช่อง input
        setIsChangingPassword(false); // ปิดฟอร์ม
      } else {
        const msg = await res.text();
        alert(`เกิดข้อผิดพลาด: ${msg}`);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user)
    return <div className="p-8 text-center text-red-500">User not found</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> กลับไปหน้า Admin Dashboard
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          ข้อมูลผู้ใช้งาน
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
          <p>
            <strong>ชื่อ:</strong> {user.name}
          </p>
          <p>
            <strong>อีเมล:</strong> {user.email}
          </p>
          <p>
            <strong>สถานะ:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-xs ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {user.role}
            </span>
          </p>
          <p>
            <strong>รหัสนิสิต:</strong> {user.studentId || "-"}
          </p>
          <p>
            <strong>คณะ:</strong> {user.faculty || "-"}
          </p>
          <p>
            <strong>สาขา:</strong> {user.major || "-"}
          </p>
          <p>
            <strong>ชั้นปี:</strong> {user.year || "-"}
          </p>

          {/* ปุ่มเปิดปิดฟอร์มเปลี่ยนรหัส */}
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition w-35"
          >
            <KeyRound size={16} className="mr-2" />
            {isChangingPassword ? "ยกเลิกการเปลี่ยนรหัส" : "เปลี่ยนรหัสผ่าน"}
          </button>
          {/* ปุ่มเปิดปิดฟอร์มเปลี่ยนรหัส */}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          คอร์สที่ลงทะเบียน ({user.enrollments.length})
        </h2>
        {/* --- vvv ส่วนฟอร์มเปลี่ยนรหัสผ่าน (แสดงเมื่อกดปุ่ม) vvv --- */}
        {isChangingPassword && (
          <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg animate-fade-in">
            <h3 className="font-semibold text-blue-800 mb-2">
              ตั้งรหัสผ่านใหม่
            </h3>
            <form
              onSubmit={handleChangePassword}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 max-w-md">
                <label className="block text-xs text-gray-500 mb-1">
                  รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                </label>
                <input
                  type="text" // ใช้ text เพื่อให้ Admin เห็นว่าพิมพ์อะไรอยู่ (หรือใช้ password ก็ได้)
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-black"
                  placeholder="ระบุรหัสผ่านใหม่..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                บันทึก
              </button>
            </form>
          </div>
        )}
        {/* --- ^^^ จบส่วนฟอร์มเปลี่ยนรหัสผ่าน ^^^ --- */}

        {user.enrollments.length === 0 ? (
          <p className="text-gray-500">
            ผู้ใช้นี้ยังไม่ได้ลงทะเบียนเรียนคอร์สใดๆ
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-black">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">ชื่อคอร์ส</th>
                  <th className="py-3 px-4 text-center">สถานะการเรียน</th>
                  <th className="py-3 px-4 text-center">วันที่ลงทะเบียน</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {user.enrollments.map((enroll) => (
                  <tr key={enroll.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {enroll.course.title}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          enroll.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {enroll.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {new Date(enroll.enrolledAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveCourse(enroll.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                        title="ยกเลิกการลงทะเบียน"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
