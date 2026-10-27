export type AdminRole = "ADMIN" | "ORG_ADMIN";

export type AdminNavItem = {
  id: "dashboard" | "courses" | "users" | "organizations" | "podcasts";
  label: string;
  description: string;
  adminOnly?: boolean;
};

const navigation: AdminNavItem[] = [
  {
    id: "dashboard",
    label: "Overview",
    description: "ภาพรวมการเรียนรู้",
  },
  {
    id: "courses",
    label: "Courses",
    description: "จัดการหลักสูตร",
  },
  {
    id: "users",
    label: "Learners",
    description: "ผู้เรียนและสิทธิ์",
    adminOnly: true,
  },
  {
    id: "organizations",
    label: "Organizations",
    description: "หน่วยงานในระบบ",
    adminOnly: true,
  },
  {
    id: "podcasts",
    label: "Podcasts",
    description: "จัดการวิดีโอ Podcast",
    adminOnly: true,
  },
];

export function getAdminNavItems(role: AdminRole): AdminNavItem[] {
  return navigation.filter((item) => role === "ADMIN" || !item.adminOnly);
}
