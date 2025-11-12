// src/app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout นี้จะไม่มี Header/Footer
  // และใช้ flex เพื่อจัดเนื้อหา (ฟอร์ม) ให้อยู่กึ่งกลาง
  return (
    <div className="flex flex-col min-h-screen ">
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
