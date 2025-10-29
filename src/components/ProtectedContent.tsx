// src/components/ProtectedContent.tsx (ฉบับ Redirect)
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1. ตรวจสอบสถานะ session
    // 2. ถ้ายังไม่ Login (unauthenticated) ให้สั่ง redirect
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]); // ให้ useEffect ทำงานทุกครั้งที่ status หรือ router เปลี่ยน

  // ขณะกำลังตรวจสอบ session หรือกำลังจะ redirect ให้แสดงผลเป็น loading
  if (status !== "authenticated") {
    return (
      <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 animate-pulse rounded-lg flex justify-center items-center">
        <p className="text-gray-500">Loading & Verifying Access...</p>
      </div>
    );
  }

  // ถ้า Login แล้ว ให้แสดงเนื้อหา (วิดีโอ)
  return <>{children}</>;
}
