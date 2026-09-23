// src/app/(main)/stats/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Database,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getBarColor,
  getBarDelay,
  getBarScale,
  getSharePercentage,
  type CategoryCourseGroup,
} from "@/lib/stats/presentation";

type CategoryStat = {
  name: string;
  count: number;
};

type CourseEnrollmentStat = {
  id: number;
  title: string;
  _count: {
    enrollments: number;
  };
};

type Stats = {
  userCount: number;
  courseCount: number;
  enrollmentCount: number;
  categoryStats: CategoryStat[];
  categoryCourseStats: CategoryCourseGroup[];
  facultyStats: CategoryStat[];
  courseEnrollmentStats: CourseEnrollmentStat[];
};

const categoryColors = ["#2563EB", "#14B8A6", "#F59E0B", "#8B5CF6", "#E85D75"];
const facultyColors = [
  "#2563EB",
  "#14B8A6",
  "#F59E0B",
  "#8B5CF6",
  "#E85D75",
  "#64748B",
  "#0EA5E9",
  "#84CC16",
  "#F97316",
];

function formatNumber(value: number) {
  return value.toLocaleString("th-TH");
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd8e5] bg-[#f7fafd] px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7eff8] text-[#5b7794]">
        {icon}
      </div>
      <p className="font-semibold text-[#253b53]">{title}</p>
      {description && <p className="mt-1 text-sm text-[#71859a]">{description}</p>}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "teal" | "amber";
}) {
  const tones = {
    blue: { icon: "bg-[#e5efff] text-[#2563EB]", value: "text-[#1d4ed8]" },
    teal: { icon: "bg-[#def7f1] text-[#0f8c78]", value: "text-[#0f766e]" },
    amber: { icon: "bg-[#fff2d7] text-[#b45309]", value: "text-[#b45309]" },
  };

  return (
    <div className="group flex items-center gap-4 border-r border-[#d6e1ec] px-5 py-1 first:pl-0 last:border-0 last:pr-0 sm:px-7">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[tone].icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#7890a7]">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className={`text-2xl font-black tracking-tight ${tones[tone].value}`}>{formatNumber(value)}</p>
          <span className="truncate text-xs text-[#7890a7]">{detail}</span>
        </div>
      </div>
    </div>
  );
}

function FacultyDonut({ faculties }: { faculties: CategoryStat[] }) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  if (!faculties.length) {
    return <EmptyState icon={<Users size={23} />} title="ยังไม่มีข้อมูลคณะ" />;
  }

  const total = faculties.reduce((sum, faculty) => sum + faculty.count, 0);
  const radius = 41;
  const circumference = 2 * Math.PI * radius;
  const percentages = faculties.map((faculty) => (total > 0 ? faculty.count / total : 0));
  const activeFaculty = hoveredSlice === null ? null : faculties[hoveredSlice];

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(190px,0.9fr)_1fr] sm:items-center">
      <div className="relative mx-auto h-56 w-56">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="สัดส่วนผู้เรียนตามคณะและสังกัด"
        >
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#edf2f7" strokeWidth="14" />
          {faculties.map((faculty, index) => {
            const percentage = percentages[index];
            const segment = Math.max(percentage * circumference - 1.8, 0);
            const offset = percentages
              .slice(0, index)
              .reduce((sum, previousPercentage) => sum + previousPercentage * circumference, 0);
            const isDimmed = hoveredSlice !== null && hoveredSlice !== index;

            return (
              <circle
                key={`${faculty.name}-${index}`}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={getBarColor(index, facultyColors)}
                strokeWidth={hoveredSlice === index ? "18" : "14"}
                strokeDasharray={`${segment} ${circumference}`}
                strokeDashoffset={-offset}
                className={`origin-center cursor-pointer transition-all duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
                onFocus={() => setHoveredSlice(index)}
                onBlur={() => setHoveredSlice(null)}
                tabIndex={0}
                aria-label={`${faculty.name}: ${formatNumber(faculty.count)} คน`}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-[9rem]">
            <p
              className="truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#8aa0b3]"
              title={activeFaculty?.name ?? "ผู้เรียนทั้งหมด"}
            >
              {activeFaculty?.name ?? "ผู้เรียนทั้งหมด"}
            </p>
            <p className="mt-1 text-3xl font-black tracking-tight text-[#172f47]">
              {formatNumber(activeFaculty?.count ?? total)}
            </p>
            <p className="text-[0.68rem] font-semibold text-[#8aa0b3]">คน</p>
          </div>
        </div>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto pr-1" aria-label="รายชื่อคณะและสังกัด">
        {faculties.map((faculty, index) => {
          const isHovered = hoveredSlice === index;
          return (
            <button
              key={`${faculty.name}-legend-${index}`}
              type="button"
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors ${isHovered ? "bg-[#f5f9fc]" : "hover:bg-[#f8fafc]"}`}
              onMouseEnter={() => setHoveredSlice(index)}
              onMouseLeave={() => setHoveredSlice(null)}
              onFocus={() => setHoveredSlice(index)}
              onBlur={() => setHoveredSlice(null)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getBarColor(index, facultyColors) }}
                />
                <span className="truncate text-xs font-semibold text-[#344e67]" title={faculty.name}>
                  {faculty.name}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-[#172f47]">
                {getSharePercentage(faculty.count, total)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryCourseList({ categories }: { categories: CategoryCourseGroup[] }) {
  if (!categories.length) {
    return <EmptyState icon={<BookOpen size={23} />} title="ยังไม่มีข้อมูลหมวดหมู่" description="เมื่อมีการลงทะเบียน ข้อมูลจะแสดงที่นี่" />;
  }

  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const maximum = Math.max(...category.courses.map((course) => course.count), 1);
        const color = getBarColor(index, categoryColors);

        return (
          <article key={`${category.name}-${index}`} className="rounded-2xl border border-[#e1e9f0] bg-[#fbfdff] p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#253f59]" title={category.name}>
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#7890a7]">
                      {category.courses.length} คอร์ส · {formatNumber(category.count)} ครั้ง
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[#172f47]">
                    {formatNumber(category.count)} <span className="text-xs font-medium text-[#8aa0b3]">ครั้ง</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-[#e7eef4] pt-3">
              {category.courses.map((course, courseIndex) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-xs font-bold text-[#3d5872]" title={course.title}>
                      {course.title}
                    </p>
                    <span className="shrink-0 text-xs font-black text-[#172f47]">
                      {formatNumber(course.count)} คน
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e9f0f5]">
                    <div
                      className="stats-bar-fill h-full rounded-full"
                      style={{
                        width: `${getBarScale(course.count, maximum)}%`,
                        backgroundColor: color,
                        animationDelay: getBarDelay(courseIndex),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function PublicStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/public/stats", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch stats");
        return response.json() as Promise<Stats>;
      })
      .then((data) => {
        setStats(data);
        setError(false);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        console.error(fetchError);
        setError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const retry = () => {
    setLoading(true);
    setError(false);
    fetch("/api/public/stats")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch stats");
        return response.json() as Promise<Stats>;
      })
      .then((data) => setStats(data))
      .catch((retryError: unknown) => {
        console.error(retryError);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:py-12" aria-busy="true">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6 motion-reduce:animate-none">
          <div className="h-64 rounded-[2rem] bg-[#dce7f1]" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-20 rounded-2xl bg-white" />
            <div className="h-20 rounded-2xl bg-white" />
            <div className="h-20 rounded-2xl bg-white" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="h-[420px] rounded-[1.75rem] bg-white" />
            <div className="h-[420px] rounded-[1.75rem] bg-white" />
          </div>
        </div>
        <p className="sr-only">กำลังโหลดข้อมูลสถิติ...</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fee8ec] text-[#d9485f]"><Activity size={30} /></div>
        <h1 className="mt-5 text-xl font-bold text-[#253b53]">ยังโหลดข้อมูลสถิติไม่ได้</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#71859a]">ตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง ข้อมูลหลักสูตรยังอยู่ครบ</p>
        <button type="button" onClick={retry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1d456a] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2563EB]">
          <RefreshCw size={16} /> ลองโหลดอีกครั้ง
        </button>
      </main>
    );
  }

  const categories = stats.categoryStats ?? [];
  const categoryCourses = stats.categoryCourseStats ?? [];
  const faculties = stats.facultyStats ?? [];
  const courses = stats.courseEnrollmentStats ?? [];
  const maxCourseCount = Math.max(...courses.map((course) => course._count.enrollments), 0);
  const featuredCategory = categories[0];
  const featuredCourse = courses[0];

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 text-[#12263a] sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#102a43] shadow-[0_24px_70px_rgba(16,42,67,0.2)]">
          <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border border-[#5bb8aa]/20" />
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-[#f3bd62]/20" />
          <div className="pointer-events-none absolute bottom-[-65px] left-[42%] h-44 w-44 rounded-full border border-white/10" />

          <div className="relative grid gap-8 px-6 pb-7 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-[1fr_0.72fr] lg:gap-14 lg:px-14 lg:pb-9">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#84d9ca]"><span className="h-2 w-2 rounded-full bg-[#f6bd60]" /> MSU E-TRAINING / LEARNING PULSE</div>
              <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">ภาพรวมการเรียนรู้<br /><span className="text-[#84d9ca]">ของแพลตฟอร์ม</span></h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-[#b9cad8] sm:text-base">ดูภาพรวมการเติบโตของผู้เรียน หลักสูตรที่ได้รับความสนใจ และชุมชนการเรียนรู้จากข้อมูลสะสมทั้งหมด</p>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:gap-5">
                <MetricCard icon={<Users size={20} />} label="ผู้เรียน" value={stats.userCount} detail="คน" tone="blue" />
                <MetricCard icon={<BookOpen size={20} />} label="หลักสูตร" value={stats.courseCount} detail="คอร์ส" tone="teal" />
                <MetricCard icon={<BarChart3 size={20} />} label="ลงทะเบียน" value={stats.enrollmentCount} detail="ครั้ง" tone="amber" />
              </div>
            </div>

            <div className="flex items-end lg:justify-end">
              <div className="w-full max-w-sm rounded-[1.75rem] bg-[#f4fbf9] p-6 text-[#102a43] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f7b8e]">Total enrollments</p>
                    <p className="mt-3 text-5xl font-black tracking-[-0.06em] text-[#102a43]">{formatNumber(stats.enrollmentCount)}</p>
                    <p className="mt-2 text-sm text-[#527080]">การลงทะเบียนเรียนสะสม</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8f2eb] text-[#0f8c78]"><TrendingUp size={22} /></div>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-[#d6e9e4] pt-4 text-xs text-[#5f7b8e]"><span>ข้อมูลการใช้งานของระบบ</span><Database size={16} className="text-[#0f8c78]" /></div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <section aria-labelledby="category-heading" className="min-w-0 rounded-[1.75rem] border border-[#dce6ef] bg-white p-6 shadow-[0_10px_35px_rgba(38,72,102,0.06)] sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]"><span className="h-1.5 w-5 rounded-full bg-[#2563EB]" /> Popularity map</div>
                <h2 id="category-heading" className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#172f47]">AI For และคอร์สที่มีผู้เรียน</h2>
                <p className="mt-1 text-sm text-[#7890a7]">ดูว่าทุกหมวดมีคอร์สอะไรบ้างและมีผู้เรียนกี่คน</p>
              </div>
              {featuredCategory && <div className="rounded-xl bg-[#edf4ff] px-3 py-2 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7090b2]">นำอยู่ตอนนี้</p><p className="mt-0.5 max-w-32 truncate text-sm font-bold text-[#1d4ed8]" title={featuredCategory.name}>{featuredCategory.name}</p></div>}
            </div>

            <div className="mt-8">
              <CategoryCourseList categories={categoryCourses} />
            </div>
          </section>

          <section aria-labelledby="faculty-heading" className="min-w-0 rounded-[1.75rem] border border-[#dce6ef] bg-white p-6 shadow-[0_10px_35px_rgba(38,72,102,0.06)] sm:p-8">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f8c78]"><span className="h-1.5 w-5 rounded-full bg-[#14B8A6]" /> Community mix</div>
              <h2 id="faculty-heading" className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#172f47]">ผู้เรียนตามคณะ</h2>
              <p className="mt-1 text-sm text-[#7890a7]">เปรียบเทียบจำนวนผู้เรียนจากแต่ละคณะและสังกัด</p>
            </div>

            <div className="mt-8">
              <FacultyDonut faculties={faculties} />
            </div>
          </section>
        </div>

        <section aria-labelledby="course-heading" className="mt-6 min-w-0 rounded-[1.75rem] border border-[#dce6ef] bg-white p-6 shadow-[0_10px_35px_rgba(38,72,102,0.06)] sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b45309]"><span className="h-1.5 w-5 rounded-full bg-[#f59e0b]" /> Course leaderboard</div>
              <h2 id="course-heading" className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#172f47]">หลักสูตรที่มีผู้เรียนสูงสุด</h2>
              <p className="mt-1 text-sm text-[#7890a7]">จัดอันดับจากจำนวนการลงทะเบียนเรียนสะสมในแต่ละหลักสูตร</p>
            </div>
            {featuredCourse && <div className="flex items-center gap-2 text-sm font-semibold text-[#617a91]"><Award size={17} className="text-[#f59e0b]" /> อันดับ 1: <span className="max-w-52 truncate text-[#b45309]" title={featuredCourse.title}>{featuredCourse.title}</span></div>}
          </div>

          <div className="mt-7">
            {courses.length > 0 ? (
              <div className="space-y-2">
                {courses.map((course, index) => {
                  const count = course._count.enrollments;
                  return <div key={course.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-[#f7fafd] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-5 sm:px-3"><div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${index === 0 ? "bg-[#fff1d3] text-[#b45309]" : "bg-[#edf2f7] text-[#6d8298]"}`}>{String(index + 1).padStart(2, "0")}</div><div className="min-w-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold text-[#344e67]" title={course.title}>{course.title}</p><span className="hidden shrink-0 text-xs font-bold text-[#7890a7] sm:inline">{getBarScale(count, maxCourseCount)}% ของอันดับสูงสุด</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf2f7]"><div className="stats-bar-fill h-full rounded-full bg-[#f4b942]" style={{ width: `${getBarScale(count, maxCourseCount)}%`, animationDelay: getBarDelay(index) }} /></div></div><p className="whitespace-nowrap text-right text-sm font-black text-[#172f47]">{formatNumber(count)} <span className="text-xs font-medium text-[#8aa0b3]">คน</span></p></div>;
                })}
              </div>
            ) : <EmptyState icon={<BookOpen size={23} />} title="ยังไม่มีข้อมูลหลักสูตร" />}
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#cbe9e1] bg-[#effaf7] px-5 py-4 text-sm text-[#39776d] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-[#d8f2eb] p-1.5 text-[#0f8c78]"><BarChart3 size={16} /></div><p><strong className="font-bold text-[#0f766e]">อ่านข้อมูลอย่างไร?</strong> ตัวเลขทั้งหมดเป็นข้อมูลสะสมของแพลตฟอร์ม และจำนวนผู้เรียนอาจลงทะเบียนได้มากกว่าหนึ่งหลักสูตร</p></div>
          <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#0f8c78]">อัปเดตจากระบบ <ArrowUpRight size={15} /></div>
        </div>
      </div>
    </main>
  );
}
