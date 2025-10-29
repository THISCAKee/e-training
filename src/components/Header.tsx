// src/components/Header.tsx (ฉบับแก้ไข)
"use client";

import Link from "next/link";
// import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { UserRound } from "lucide-react";

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
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4">
          <p>
            <span className="text-2xl font-bold text-neutral-950">
              E-Training
            </span>
          </p>
          {/*<Image
            src="/logo02.png"
            alt=""
            width={45}
            height={40}
            className="rounded-md"
          />
          <Image
            src="/logo01.png"
            alt=""
            width={45}
            height={40}
            className="rounded-md"
          />*/}
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/courses"
            className="text-gray-600 text-[20px] font-bold hover:text-blue-600"
          >
            หลักสูตรทั้งหมด
          </Link>

          {status === "loading" ? (
            <div className="text-gray-500">Loading...</div>
          ) : session ? (
            // === ส่วนที่แก้ไข: เมื่อ Login แล้ว ===
            <div className="relative" ref={dropdownRef}>
              {/* ปุ่มไอคอน Profile */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-full text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <UserRound size={35} />
              </button>

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
                    Dashboard
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
