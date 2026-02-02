"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterStaffPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    faculty: "", // เพิ่ม field department
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          faculty: formData.faculty,
        }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          ลงทะเบียนสำหรับบุคลากร
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-2 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              อีเมล
            </label>
            <input
              type="email"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-2 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* ▼▼▼ ช่องกรอกสังกัด/คณะ ▼▼▼ */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              สังกัด / คณะ
            </label>
            <input
              type="text"
              required
              //placeholder="เช่น คณะวิทยาศาสตร์, สำนักคอมพิวเตอร์"
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-2 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.faculty}
              onChange={(e) =>
                setFormData({ ...formData, faculty: e.target.value })
              }
            />
          </div>
          {/* ▲▲▲ -------------------- ▲▲▲ */}

          <div>
            <label className="block text-sm font-medium text-gray-900">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-2 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-2 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-900">
            สมัครสมาชิกทั่วไป?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              คลิกที่นี่
            </Link>
          </p>
          <p className="mt-2 text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
