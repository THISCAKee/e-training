// src/app/layout.tsx

import type { Metadata } from "next";
// 1. นำเข้าฟอนต์ Anuphan
import { Anuphan } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

// 2. ตั้งค่าฟอนต์ พร้อมระบุ subset 'thai' และ 'latin'
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  display: "swap", // ช่วยให้แสดงผลได้เร็วขึ้น
  variable: "--font-anuphan", // ตั้งชื่อตัวแปร CSS (ถ้าต้องการใช้)
});

export const metadata: Metadata = {
  title: "MSU e-Training",
  description: "เรียนรู้และพัฒนาทักษะยุคใหม่",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${anuphan.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          {" "}
          {/* 2. Wrap ด้วย AuthProvider */}
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
