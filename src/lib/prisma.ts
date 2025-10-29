// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // อนุญาตให้ 'prisma' ถูกเก็บใน global object ของ Node.js
  var prisma: PrismaClient | undefined;
}

// ป้องกันการสร้าง PrismaClient ใหม่ทุกครั้งที่มีการ hot-reload ใน development
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
