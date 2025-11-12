// src/components/Header.tsx (ฉบับแก้ไข)
"use client";

import Link from "next/link";
// import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/*
       * sticky: ทำให้ element นี้ "ลอย" อยู่ในตำแหน่ง
       * top-0: กำหนดให้ลอยอยู่ติดขอบบน (top: 0px)
       * z-50: กำหนด z-index ให้สูงๆ เพื่อให้ลอยทับเนื้อหาอื่น (เลข 50 คือสูงมาก)
       */}
      {/* --- ^^^^ สิ้นสุดการแก้ไข ^^^^ --- */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4">
          {/*<p>
            <span className="text-3xl font-bold text-yellow-400 text-shadow-lg/20 hover:text-amber-500">
              E-TRAINING
            </span>
          </p>*/}
          <Image
            src="/logo_etraining.png"
            alt=""
            width={80}
            height={45}
            className="rounded-md shadow-md hover:shadow-amber-400 hover:shadow-md"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            href="/courses"
            className="text-gray-600 text-[18px] font-normal hover:text-blue-600 px-4"
          >
            หลักสูตรทั้งหมด
          </Link>
          {!session && status !== "loading" && (
            <Link
              href="/register"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 "
            >
              สมัครสมาชิก
            </Link>
          )}

          {status === "loading" ? (
            <div className="text-gray-500">Loading...</div>
          ) : session ? (
            // === ส่วนที่แก้ไข: เมื่อ Login แล้ว ===
            <div className="relative" ref={dropdownRef}>
              {/* ปุ่มไอคอน Profile */}
              <Link
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-full text-gray-600 hover:text-blue-600 focus:outline-none"
                href={""}
              >
                <CircleUserRound size={35} />
              </Link>

              {/* Dropdown Menu (แสดงเมื่อ isDropdownOpen เป็น true) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-20 border">
                  {/* (Optional) แสดงชื่อและอีเมลผู้ใช้ */}
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-800">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>

                  {/* ลิงก์ Dashboard */}
                  <Link
                    href={
                      session.user?.role === "ADMIN" ? "/admin" : "/dashboard"
                    }
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)} // คลิกแล้วให้ปิด
                  >
                    {session.user?.role === "ADMIN"
                      ? "Dashboard"
                      : "หลักสูตรทั้งหมด"}
                  </Link>

                  {/* ปุ่ม ออกจากระบบ */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false); // คลิกแล้วให้ปิด
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            // === เมื่อยังไม่ได้ Login (เหมือนเดิม) ===
            <Link
              href="/login"
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
