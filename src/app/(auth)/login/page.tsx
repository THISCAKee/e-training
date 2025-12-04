"use client";

import { useState, Suspense } from "react"; // 1. เพิ่ม import Suspense
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

// 2. เปลี่ยนชื่อ Component เดิมจาก LoginPage เป็น "LoginForm" (เพื่อเป็นไส้ใน)
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error =
    searchParams.get("error") === "CredentialsSignin"
      ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    await signIn("credentials", {
      email,
      password,
      callbackUrl,
    });

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          เข้าสู่ระบบบัญชีของคุณ
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}
        <div className="space-y-4 rounded-md">
          <div>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              id="password"
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
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </div>
        <div className="text-sm text-center">
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ยังไม่มีบัญชี? สมัครสมาชิก
          </Link>
        </div>
      </form>
    </div>
  );
}

// 3. สร้าง Component หลัก (export default) มาครอบด้วย Suspense
export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-10">กำลังโหลด...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
