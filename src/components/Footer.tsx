// src/components/Footer.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-[#e6ebef] mt-auto">
      <div className="container mx-auto flex flex-col items-center gap-4 px-6 py-8 text-center text-sm text-[#66788a] sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="flex items-center gap-6">
          <Image src="/logo02.png" alt="" width={70} height={99} className="h-auto w-[40px] shrink-0" />
          <Image src="/logo01.png" alt="" width={100} height={125} className="h-auto w-[52px] shrink-0" />
        </Link>
        <p>
          &copy; {new Date().getFullYear()} AI-Training Platform. Mahasarakham
          University.
        </p>
      </div>
    </footer>
  );
}
