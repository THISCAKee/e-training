"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Search,
  Settings2,
  ShieldAlert,
  UsersRound,
  X,
} from "lucide-react";
import UserList from "@/components/admin/UserList";
import CourseList from "@/components/admin/CourseList";
import AdminStats from "@/components/admin/AdminStats";
import OrganizationList from "@/components/admin/OrganizationList";
import { AdminBrand, AdminProfile } from "@/components/admin/AdminChrome";
import { getAdminNavItems, type AdminNavItem } from "@/lib/admin/presentation";

type Tab = AdminNavItem["id"];

function NavIcon({ id }: { id: Tab }) {
  if (id === "dashboard") return <LayoutDashboard size={18} strokeWidth={1.8} />;
  if (id === "courses") return <BookOpen size={18} strokeWidth={1.8} />;
  if (id === "users") return <UsersRound size={18} strokeWidth={1.8} />;
  return <Building2 size={18} strokeWidth={1.8} />;
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f8] px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0f766e]" />
        <p className="mt-4 text-sm font-medium text-slate-500">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;
  const isOrgAdmin = userRole === "ORG_ADMIN";
  const isAdmin = userRole === "ADMIN";
  const navItems = getAdminNavItems(isOrgAdmin ? "ORG_ADMIN" : "ADMIN");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (!isAdmin && !isOrgAdmin)) {
      router.push("/");
    }
  }, [isAdmin, isOrgAdmin, router, session, status]);

  if (status === "loading") return <LoadingState />;

  if (!isAdmin && !isOrgAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f8] px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fff1ef] text-[#d85d4d]">
            <ShieldAlert size={30} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="mt-2 text-sm text-slate-500">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  const currentNav = navItems.find((item) => item.id === activeTab) ?? navItems[0];
  const displayName = session?.user?.name || "ผู้ดูแลระบบ";

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminStats />;
      case "users":
        return isAdmin ? <UserList /> : null;
      case "courses":
        return <CourseList />;
      case "organizations":
        return isAdmin ? <OrganizationList /> : null;
      default:
        return null;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-dashboard min-h-screen bg-[#f5f7f8] text-slate-900">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] shrink-0 flex-col border-r border-slate-800/80 bg-[#18232f] px-4 py-5 text-slate-300 shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-2">
            <AdminBrand />
            <button
              type="button"
              aria-label="ปิดเมนู"
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-12">
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <nav className="mt-3 space-y-1.5" aria-label="เมนูผู้ดูแลระบบ">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => handleTabChange(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"}`}
                  >
                    <span className={`absolute left-0 h-7 w-1 rounded-r-full bg-[#8ad1c5] transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-[#0f766e] text-white" : "bg-white/[0.05] text-slate-400 group-hover:bg-white/10"}`}>
                      <NavIcon id={item.id} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={`mt-0.5 block truncate text-[0.68rem] ${isActive ? "text-[#bce8df]" : "text-slate-500"}`}>{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center gap-2 text-[#f5b942]">
              <Settings2 size={15} />
              <span className="text-xs font-semibold">Admin workspace</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">จัดการหลักสูตรและติดตามการเรียนรู้ในพื้นที่ของคุณ</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f5f7f8]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.5rem] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="เปิดเมนู"
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:border-slate-300 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={19} />
                </button>
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="hidden font-medium text-slate-400 sm:inline">Admin</span>
                  <ChevronRight size={15} className="hidden text-slate-300 sm:inline" />
                  <span className="truncate font-semibold text-slate-800">{currentNav?.label}</span>
                </div>
              </div>

              <div className="hidden w-full max-w-xs items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-400 shadow-sm md:flex">
                <Search size={16} />
                <input aria-label="ค้นหา" placeholder="ค้นหาหลักสูตร..." className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-slate-400">⌘ K</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  aria-label="การแจ้งเตือน"
                  className="relative rounded-xl p-2 text-slate-500 hover:bg-white hover:text-[#0f766e]"
                >
                  <Bell size={19} />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ef6a5b]" />
                </button>
                <div className="hidden h-7 w-px bg-slate-200 sm:block" />
                <AdminProfile displayName={displayName} isOrgAdmin={isOrgAdmin} />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#0f766e]">Learning operations</p>
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#18232f] sm:text-4xl">
                  {currentNav?.id === "dashboard" ? "ภาพรวมการเรียนรู้" : currentNav?.label}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {currentNav?.id === "dashboard"
                    ? `ยินดีต้อนรับ, ${displayName} — ติดตามภาพรวมของ e-Training ได้จากหน้านี้`
                    : currentNav?.description}
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#0f766e]" />
                {isOrgAdmin ? "Organization scope" : "System scope"}
              </div>
            </div>

            <div className="min-h-[31rem]">{renderTabContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
