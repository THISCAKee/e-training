// src/app/(main)/layout.tsx

import Header from "@/components/Header"; // 1. Import Header
// import Footer from "@/components/Footer"; // 2. Import Footer

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout นี้จะมี Header/Footer ตามปกติ
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
