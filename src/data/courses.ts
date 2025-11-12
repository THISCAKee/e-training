// src/data/courses.ts

// --- vvvv แก้ไข Type นี้ vvvv ---
export type Course = {
  videoUrl: any;
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  // (เพิ่ม) category อาจจะมีหรือไม่มีก็ได้ (เป็น optional)
  category?: {
    name: string;
  } | null;
};
// --- ^^^^ สิ้นสุดการแก้ไข ^^^^ ---

// (ข้อมูล coursesData ที่เป็น static จะไม่มี category นะครับ
// แต่ข้อมูลที่ดึงจาก API จะมี)
export const coursesData: Course[] = [
  // ... (ข้อมูล static เดิม) ...
];
