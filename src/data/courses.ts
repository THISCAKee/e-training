// src/data/courses.ts

// กำหนด Type เพื่อให้ TypeScript รู้จักโครงสร้างข้อมูลของเรา
export type Course = {
  videoUrl: any;
  id: number;
  title: string;
  description: string;
  imageUrl: string;
};

export const coursesData: Course[] = [
  {
    id: 1,
    title: "Next.js 15 & React: The Complete Guide",
    description:
      "เรียนรู้การสร้างเว็บแอปพลิเคชันสมัยใหม่ด้วย Next.js ตั้งแต่พื้นฐานจนถึงระดับสูง",
    imageUrl: "https://placehold.co/600x400/3498db/ffffff?text=Next.js",
  },
  {
    id: 2,
    title: "Mastering Tailwind CSS 4",
    description:
      "เปลี่ยนไอเดียให้เป็นดีไซน์ที่สวยงามและตอบสนองทุกหน้าจอด้วย Tailwind CSS",
    imageUrl: "https://placehold.co/600x400/38bdf8/ffffff?text=Tailwind",
  },
  {
    id: 3,
    title: "Full-Stack Web Development with MySQL",
    description:
      "สร้างเว็บแอปพลิเคชันเต็มรูปแบบพร้อมฐานข้อมูล MySQL สำหรับจัดการข้อมูล",
    imageUrl: "https://placehold.co/600x400/f59e0b/ffffff?text=MySQL",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    description:
      "เรียนรู้หลักการออกแบบ UI/UX ที่ดี เพื่อสร้างประสบการณ์ผู้ใช้ที่น่าประทับใจ",
    imageUrl: "https://placehold.co/600x400/8b5cf6/ffffff?text=UI/UX",
  },
];
