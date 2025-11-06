"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link เพิ่ม
import { FileText } from "lucide-react"; // Import Icon เพิ่ม

// --- vvvv 1. อัปเดต Interface Props vvvv ---
interface StartLearningButtonProps {
  courseId: number;
  enrollmentStatus: "IN_PROGRESS" | "COMPLETED" | null; // รับ Status
  latestPassedAttemptId: number | null; // รับ Attempt ID
}
// --- ^^^^ สิ้นสุดการอัปเดต ^^^^ ---

export function StartLearningButton({
  courseId,
  enrollmentStatus,
  latestPassedAttemptId,
}: StartLearningButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnrollAndLearn = async () => {
    // ฟังก์ชันนี้ใช้สำหรับปุ่ม "เริ่มเรียน" หรือ "เรียนต่อ" เท่านั้น
    setIsLoading(true);
    try {
      const res = await fetch(`/api/enroll/${courseId}`, { method: "POST" });
      if (!res.ok) throw new Error("Enrollment failed");
      const data = await res.json();
      if (data.success) {
        router.push(`/courses/${courseId}/learn`);
      } else {
        throw new Error(data.message || "Enrollment failed");
      }
    } catch (error) {
      console.error("Failed to start learning:", error);
      alert("เกิดข้อผิดพลาดในการเริ่มเรียน");
      setIsLoading(false);
    }
  };

  // --- vvvv 2. ปรับ Logic การแสดงผล vvvv ---
  if (enrollmentStatus === "COMPLETED" && latestPassedAttemptId) {
    // กรณี: เรียนจบแล้ว และมี Attempt ID
    return (
      <Link
        href={`/results/${latestPassedAttemptId}`} // ลิงก์ไปหน้าผลลัพธ์
        className="inline-flex items-center bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg px-8 py-3 rounded-md transition duration-300 shadow-md"
      >
        <FileText size={20} className="mr-2" />
        สำเร็จการศึกษา (ดูผลคะแนน)
      </Link>
    );
  } else if (enrollmentStatus === "COMPLETED") {
    // กรณี: เรียนจบแล้ว แต่หา Attempt ID ไม่เจอ (แสดงเป็นสถานะเฉยๆ)
    return (
      <span className="inline-block bg-green-100 text-green-800 font-bold text-lg px-8 py-3 rounded-md shadow-md cursor-default">
        สำเร็จการศึกษาแล้ว
      </span>
    );
  } else {
    // กรณี: ยังไม่ลงทะเบียน (null) หรือ กำลังเรียน (IN_PROGRESS)
    const isEnrolled = enrollmentStatus === "IN_PROGRESS";
    return (
      <Link
        onClick={handleEnrollAndLearn} // เรียกฟังก์ชัน Enroll + Redirect
        // disabled={isLoading}
        className={`inline-block font-bold text-lg px-8 py-3 rounded-md transition duration-300 shadow-md
          ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : isEnrolled
                ? "bg-green-600 hover:bg-green-700 text-white" // เรียนต่อ (เขียว)
                : "bg-blue-600 hover:bg-blue-700 text-white" // เริ่มเรียน (น้ำเงิน)
          }
          disabled:opacity-70 disabled:cursor-wait`}
        href={""}
      >
        {isLoading ? "กำลังโหลด..." : isEnrolled ? "เรียนต่อ" : "เริ่มเรียน"}
      </Link>
    );
  }
  // --- ^^^^ สิ้นสุดการปรับ Logic ^^^^ ---
}
