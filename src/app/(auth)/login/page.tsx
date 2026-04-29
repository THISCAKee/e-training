"use client";

import { useState, Suspense } from "react"; // 1. เพิ่ม import Suspense
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// 2. เปลี่ยนชื่อ Component เดิมจาก LoginPage เป็น "LoginForm" (เพื่อเป็นไส้ใน)
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Error จาก URL params (กรณี redirect มาจากหน้าอื่น)
  const urlError =
    searchParams.get("error") === "CredentialsSignin"
      ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      : null;

  // รวม error ทั้ง 2 แหล่ง
  const error = loginError || urlError;

  // ถ้า login แล้วและเป็น ORG_ADMIN หรือ ADMIN ให้ redirect ไปหน้า admin
  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "ORG_ADMIN" || session.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push(callbackUrl);
      }
    }
  }, [session, router, callbackUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    // ORG_ADMIN และ ADMIN จะถูก redirect ไปหน้า /admin โดย useEffect ด้านบน
    // เมื่อ session ถูกสร้างเรียบร้อยแล้ว
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // ป้องกันการ redirect อัตโนมัติ เพื่อให้เราจัดการ redirect เอง
    });

    if (result?.error) {
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    } else if (result?.ok) {
      // ดึง session ใหม่หลังจาก login สำเร็จ โดยข้าม cache ของ next-auth
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const newSession = await res.json();
      
      if (newSession?.user?.role === "ORG_ADMIN" || newSession?.user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        // ป้องกันไม่ให้ redirect กลับมาหน้า login
        if (callbackUrl.includes("/login")) {
          window.location.href = "/";
        } else {
          window.location.href = callbackUrl;
        }
      }
    }
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
