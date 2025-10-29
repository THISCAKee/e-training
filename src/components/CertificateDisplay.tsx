// src/components/CertificateDisplay.tsx
import Image from "next/image";
import { Award } from "lucide-react";

// 1. สร้าง Interface สำหรับ Props ที่จะรับเข้ามา
interface CertificateDisplayProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  logoPath?: string; // Path ไปยังโลโก้ (Optional)
  directorName?: string; // ชื่อผู้อำนวยการ (Optional)
  directorTitle?: string; // ตำแหน่ง (Optional)
}

// 2. สร้าง Component (ไม่ต้อง 'use client')
export default function CertificateDisplay({
  userName,
  courseTitle,
  completionDate,
  logoPath = "/logo01.png", // ใส่ default path
  directorName = "รองศาสตราจารย์ ดร.รัตนโชติ เทียนมงคล",
  directorTitle = "ผู้อำนวยการสำนักวิทยบริการ",
}: CertificateDisplayProps) {
  // 3. ใช้ JSX เดิมจากหน้า Certificate แต่ปรับเล็กน้อย
  return (
    <div className="bg-white p-10 md:p-16 rounded-lg shadow-xl border-4 border-yellow-500 max-w-4xl w-full text-center relative print:shadow-none print:border-none">
      {/* โลโก้ */}
      <div className="absolute top-8 left-8 print:block hidden md:block">
        {" "}
        {/* ซ่อนใน mobile, แสดงตอน print */}
        <Image
          src={logoPath}
          alt="Logo"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>

      {/* เนื้อหา Certificate */}
      <Award className="w-20 h-20 text-yellow-600 mx-auto mb-4 mt-16 md:mt-0" />
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
        ประกาศนียบัตร
      </h1>
      <p className="text-lg text-gray-600 mb-8">มอบให้เพื่อแสดงว่า</p>
      <p className="text-3xl md:text-4xl font-semibold text-blue-700 mb-4">
        {userName}
      </p>
      <p className="text-lg text-gray-600 mb-4">ได้สำเร็จ</p>
      <p className="text-lg text-gray-600 mb-8">
        หลักสูตร &quot;{courseTitle}&quot;
      </p>
      <p className="text-md text-gray-500 mb-16">
        เมื่อวันที่ {completionDate}
      </p>

      {/* ลายเซ็น */}
      <div className="mt-12 pt-8 border-t border-gray-300 flex flex-col items-center">
        {/* (Optional) <Image src="/signature.png" ... /> */}
        <p className="mt-2 text-lg font-medium text-gray-700">{directorName}</p>
        <p className="text-md text-gray-600">{directorTitle}</p>
      </div>
    </div>
  );
}
