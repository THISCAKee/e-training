"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2

export default function RegisterPage() {
  const router = useRouter();

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // เพิ่มยืนยันรหัสผ่านเพื่อความปลอดภัย
    studentId: "",
    faculty: "",
    program: "",
    major: "",
    year: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันจัดการการเปลี่ยนค่าใน Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // 1. Validation เบื้องต้น
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกรหัสผ่านยืนยันให้ถูกต้อง",
      });
      setIsLoading(false);
      return;
    }

    if (formData.studentId.length !== 11) {
      Swal.fire({
        icon: "warning",
        title: "รหัสนิสิตไม่ถูกต้อง",
        text: "รหัสนิสิตต้องมี 11 หลัก",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year) || null,
        }),
      });

      const msg = await response.text();

      if (response.ok) {
        // ✅ สมัครสำเร็จ
        Swal.fire({
          icon: "success",
          title: "สมัครสมาชิกสำเร็จ!",
          text: "ระบบจะพาท่านไปยังหน้าเข้าสู่ระบบ",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          router.push("/login");
        });
      } else {
        // ❌ เกิดข้อผิดพลาด
        if (msg.includes("อีเมลนี้มีอยู่แล้ว")) {
          Swal.fire({
            icon: "error",
            title: "อีเมลนี้ถูกใช้งานแล้ว",
            text: "กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ",
          });
        } else if (msg.includes("รหัสนิสิตมีในระบบอยู่แล้ว")) {
          Swal.fire({
            icon: "error",
            title: "รหัสนิสิตนี้มีในระบบแล้ว",
            text: "กรุณาตรวจสอบความถูกต้องอีกครั้ง",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: msg || "ไม่สามารถสมัครสมาชิกได้",
          });
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-3 p-10 bg-white rounded-xl shadow-lg">
      <div>
        <h2 className="mt-6 text-center text-2xl font-medium tracking-tight text-gray-900">
          สร้างบัญชีใหม่ (นิสิต)
        </h2>
      </div>

      <div className="mt-2 text-sm text-center text-black">
        บุคลากรภายใน{" "}
        <Link
          href="/register-staff"
          className="text-blue-600 font-bold hover:underline text-[16px]"
        >
          ลงทะเบียนบุคลากร
        </Link>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-md">
          {/* Name */}
          <input
            name="name"
            type="text"
            required
            className="text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="ชื่อ-นามสกุล"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            required
            className="text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="อีเมล"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Student ID */}
          <input
            name="studentId"
            type="text" // ใช้ text แทน number เพื่อป้องกันปัญหาการแสดงผลลูกศรขึ้นลง
            maxLength={11}
            required
            className="text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="รหัสนิสิต (11 หลัก)"
            value={formData.studentId}
            onChange={(e) => {
              // ให้กรอกได้เฉพาะตัวเลข
              const val = e.target.value.replace(/\D/g, "");
              setFormData((prev) => ({ ...prev, studentId: val }));
            }}
          />

          {/* Faculty & Major Row */}
          <div className="flex gap-4">
            <input
              name="faculty"
              type="text"
              required
              className="text-gray-900 w-1/2 rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="คณะ"
              value={formData.faculty}
              onChange={handleChange}
            />
            <input
              name="major"
              type="text"
              required
              className="text-gray-900 w-1/2 rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="สาขา"
              value={formData.major}
              onChange={handleChange}
            />
          </div>

          {/* Program & Year Row */}
          <div className="flex gap-4">
            <input
              name="program"
              type="text"
              required
              className="text-gray-900 w-2/3 rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="หลักสูตร"
              value={formData.program}
              onChange={handleChange}
            />
            <input
              name="year"
              type="number"
              min="1"
              max="8"
              required
              className="text-gray-900 w-1/3 rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="ชั้นปี"
              value={formData.year}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <input
            name="password"
            type="password"
            required
            className="text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="รหัสผ่าน"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Confirm Password */}
          <input
            name="confirmPassword"
            type="password"
            required
            className="text-gray-900 block w-full rounded-md border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="ยืนยันรหัสผ่าน"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </div>
      </form>
    </div>
  );
}
