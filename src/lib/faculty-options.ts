import prisma from "@/lib/prisma";
import { MSU_FACULTIES } from "@/lib/faculties";

// รายชื่อคณะ/หน่วยงานในระบบ: คณะตั้งต้น คณะที่ผู้ใช้มีอยู่แล้ว และหน่วยงาน
export async function getFacultyOptions(): Promise<string[]> {
  const [users, organizations] = await Promise.all([
    prisma.user.findMany({
      select: { faculty: true },
      where: { faculty: { not: null } },
      distinct: ["faculty"],
    }),
    prisma.organization.findMany({ select: { name: true } }),
  ]);

  const names = [
    ...MSU_FACULTIES,
    ...users.map((user) => user.faculty?.trim()),
    ...organizations.map((organization) => organization.name.trim()),
    // ตัดค่าที่ไม่ใช่ชื่อจริง เช่น "-" ที่เคยกรอกไว้แทนค่าว่าง
  ].filter((name): name is string => Boolean(name && /\p{L}/u.test(name)));

  return [...new Set(names)].sort((a, b) => a.localeCompare(b, "th"));
}
