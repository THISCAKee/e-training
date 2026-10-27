"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Podcast,
  BookOpen,
  Building2,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Settings2,
  ShieldAlert,
  UsersRound,
  X,
} from "lucide-react";
import PodcastManagement from "@/components/admin/PodcastManagement";
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
  if (id === "podcasts") return <Podcast size={18} strokeWidth={1.8} />;
  if (id === "users") return <UsersRound size={18} strokeWidth={1.8} />;
  return <Building2 size={18} strokeWidth={1.8} />;
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
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
      case "podcasts":
        return isAdmin ? <PodcastManagement /> : null;
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
    <div className="admin-dashboard relative isolate min-h-screen overflow-x-clip bg-[#f5f5f7] text-slate-900">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[16.5rem] shrink-0 flex-col border-r border-slate-200/75 bg-[#f8f8fa]/90 px-4 py-5 text-slate-600 shadow-[8px_0_30px_rgba(15,23,42,0.035)] backdrop-blur-2xl transition-[transform,background-color] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-2">
            <AdminBrand />
            <button
              type="button"
              aria-label="ปิดเมนู"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-900 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-12">
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
            <nav className="mt-3 space-y-1.5" aria-label="เมนูผู้ดูแลระบบ">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => handleTabChange(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 ${isActive ? "border-slate-200/70 bg-white text-slate-900 shadow-[0_1px_5px_rgba(15,23,42,0.055)]" : "border-transparent text-slate-500 hover:border-slate-200/70 hover:bg-white/75 hover:text-slate-900"}`}
                  >
                    <span className={`absolute left-[-1px] h-7 w-[3px] rounded-full bg-blue-600 transition-all duration-200 ${isActive ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0"}`} />
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${isActive ? "scale-105 bg-blue-700 text-white shadow-[0_5px_16px_rgba(37,99,235,0.2)]" : "bg-slate-900/[0.035] text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-800"}`}>
                      <NavIcon id={item.id} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={`mt-0.5 block truncate text-[0.68rem] ${isActive ? "text-blue-800/65" : "text-slate-400"}`}>{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-xl border border-slate-200/70 bg-white/75 p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Settings2 size={15} strokeWidth={1.8} />
              <span className="text-xs font-semibold">Admin workspace</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">จัดการหลักสูตรและติดตามการเรียนรู้ในพื้นที่ของคุณ</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 px-3 pt-3 sm:px-5">
            <div className="mx-auto flex h-[4.25rem] max-w-[1600px] items-center justify-between gap-4 rounded-2xl border border-white/90 bg-white/80 px-4 shadow-[0_2px_14px_rgba(15,23,42,0.045)] backdrop-blur-2xl sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="เปิดเมนู"
                  className="rounded-xl border border-white/90 bg-white/75 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:text-blue-800 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={19} />
                </button>
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="hidden font-medium text-slate-400 sm:inline">Workspace</span>
                  <ChevronRight size={15} className="hidden text-slate-300 sm:inline" />
                  <span className="truncate font-semibold text-slate-800">{currentNav?.label}</span>
                </div>
              </div>

              <div className="flex items-center">
                <AdminProfile
                  displayName={displayName}
                  isOrgAdmin={isOrgAdmin}
                  avatarUrl={session?.user?.image}
                  avatarSeed={session?.user?.id || displayName}
                />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-7 sm:px-6 sm:pt-9 lg:px-10 lg:pt-10">
            <div key={`admin-title-${activeTab}`} className="admin-content-enter mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue-800/75">Learning operations</p>
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">
                  {currentNav?.id === "dashboard" ? "ภาพรวมการเรียนรู้" : currentNav?.label}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {currentNav?.id === "dashboard"
                    ? `ยินดีต้อนรับ, ${displayName} — ติดตามภาพรวมของ AI-Training ได้จากหน้านี้`
                    : currentNav?.description}
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/70 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500/45 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-700" />
                </span>
                {isOrgAdmin ? "Organization scope" : "System scope"}
              </div>
            </div>

            <div key={`admin-content-${activeTab}`} className="admin-content-enter min-h-[31rem]">{renderTabContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
