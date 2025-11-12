// src/app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  // 1. เพิ่ม State สำหรับ field ใหม่
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState(""); // <-- เพิ่ม
  const [faculty, setFaculty] = useState(""); // <-- เพิ่ม
  const [program, setProgram] = useState(""); // <-- เพิ่ม
  const [major, setMajor] = useState(""); // <-- เพิ่ม
  const [year, setYear] = useState(""); // <-- เพิ่ม (รับเป็น string ก่อน)

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!studentId || studentId.trim().length === 0) {
      setError("กรุณากรอกรหัสนิสิต");
      setIsLoading(false);
      return; // หยุดทำงาน
    }
    if (studentId.length !== 11) {
      setError("รหัสนิสิตต้องมี 11 ตัวอักษรพอดี");
      setIsLoading(false);
      return; // หยุดทำงาน
    }

    // --- vvvv 2. เพิ่ม field ใหม่ใน body ที่จะส่ง vvvv ---
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        studentId, // <-- เพิ่ม
        faculty, // <-- เพิ่ม
        program, // <-- เพิ่ม
        major, // <-- เพิ่ม
        year: parseInt(year) || null, // <-- เพิ่ม (แปลงเป็น Int หรือ null)
      }),
    });
    // --- ^^^^ สิ้นสุดการแก้ไข ^^^^ ---

    if (response.ok) {
      console.log("Registration successful!");
      router.push("/login");
    } else {
      const data = await response.json();
      setError(data.message || "Something went wrong!");
      console.error("Registration failed:", data);
    }

    setIsLoading(false);
  };

  return (
    // <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg">
      <div>
        <h2 className="mt-6 text-center text-2xl font-medium tracking-tight text-gray-900">
          สร้างบัญชีใหม่
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {/* --- vvvv 3. เพิ่ม Input Fields ใหม่ vvvv --- */}
        <div className="space-y-4 rounded-md">
          {/* Name */}
          <div>
            <input
              name="name"
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Email */}
          <div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Student ID */}
          <div>
            <input
              name="studentId"
              type="number"
              minLength={11}
              maxLength={11}
              required // อาจจะ required หรือไม่ก็ได้
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="รหัสนิสิต"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          {/* Faculty */}
          <div>
            <input
              name="faculty"
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="คณะ"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </div>
          {/* Major */}
          <div>
            <input
              name="major"
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="สาขา"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>
          {/* Program */}
          <div>
            <input
              name="program"
              type="text"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="หลักสูตร"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
          </div>
          {/* Year */}
          <div>
            <input
              name="year"
              type="number"
              min="1"
              max="8" // จำกัดค่าตัวเลข
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="ชั้นปี (ตัวเลข)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          {/* Password */}
          <div>
            <input
              name="password"
              type="password"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {/* --- ^^^^ สิ้นสุดการแก้ไข ^^^^ --- */}

        {error && <p className="text-sm text-center text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </div>
      </form>
    </div>
    // </div>
  );
}
