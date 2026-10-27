"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  GraduationCap,
  Layers3,
  UsersRound,
} from "lucide-react";
import {
  getBarDelay,
  getBarScale,
  getSharePercentage,
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
  lessonCount?: number;
  enrollmentCount: number;
  categoryStats: CategoryStat[];
  facultyStats: CategoryStat[];
  certificateStats: CategoryStat[];
  courseEnrollmentStats: CourseEnrollmentStat[];
};

const panelClass =
  "rounded-[1.35rem] border border-slate-200/70 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]";

const graphGradients = [
  ["#93c5fd", "#dbeafe"],
  ["#bea8f4", "#e9ddff"],
  ["#eba8cf", "#fde2f1"],
  ["#f1cf7c", "#fff1c9"],
  ["#91d1b5", "#d8f2e8"],
  ["#86c8e5", "#d6f0fc"],
] as const;

function getGraphGradient(index: number, direction: "0deg" | "90deg" = "90deg") {
  const [start, end] = graphGradients[index % graphGradients.length];
  return `linear-gradient(${direction}, ${start}, ${end})`;
}

const formatNumber = (value: number) => value.toLocaleString("th-TH");

function StatCard({
  label,
  value,
  detail,
  icon,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  accent: "blue" | "indigo" | "sky";
}) {
  const accentStyles = {
    blue: {
      icon: "bg-[#e5efff] text-[#356fc1]",
      glow: "from-blue-100/80 via-sky-50/80 to-white/0",
      value: "text-slate-900",
    },
    indigo: {
      icon: "bg-[#e9edff] text-[#526fb6]",
      glow: "from-indigo-100/80 via-blue-50/80 to-white/0",
      value: "text-slate-900",
    },
    sky: {
      icon: "bg-[#e2f4ff] text-[#397ca5]",
      glow: "from-sky-100/80 via-cyan-50/80 to-white/0",
      value: "text-slate-900",
    },
  }[accent];

  return (
    <article className={`${panelClass} group relative overflow-hidden p-5 sm:p-6`}>
      <div
        className={`absolute -right-12 -top-14 h-36 w-36 rounded-full bg-gradient-to-br blur-2xl transition-transform duration-500 group-hover:scale-110 ${accentStyles.glow}`}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-3 text-3xl font-bold tracking-tight ${accentStyles.value}`}>
            {formatNumber(value)}
          </p>
          <p className="mt-2 text-xs text-slate-400">{detail}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentStyles.icon}`}>{icon}</div>
      </div>
    </article>
  );
}

function PanelHeader({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#315e9c]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 text-center">
      <div className="rounded-2xl bg-white p-3 text-slate-300 shadow-sm">
        <BarChart3 size={22} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-xs text-slate-400">ข้อมูลจะแสดงเมื่อมีการใช้งาน</p>
    </div>
  );
}

function CategoryBars({ categories }: { categories: CategoryStat[] }) {
  if (!categories.length) return <EmptyPanel label="ยังไม่มีข้อมูลหมวดหมู่" />;

  const visibleCategories = categories.slice(0, 6);
  const maximum = Math.max(...visibleCategories.map((category) => category.count), 1);

  return (
    <div className="space-y-5">
      {visibleCategories.map((category, index) => (
        <div key={`${category.name}-${index}`}>
          <div className="mb-2 flex items-center justify-between gap-4 text-sm">
            <span className="min-w-0 truncate font-semibold text-slate-700" title={category.name}>
              {category.name}
            </span>
            <span className="shrink-0 font-bold text-slate-900">
              {formatNumber(category.count)}
            </span>
          </div>
          <div className="h-8 overflow-hidden rounded-md bg-slate-100">
            <div
              className="stats-bar-fill h-full rounded-md"
              style={{
                width: `${getBarScale(category.count, maximum)}%`,
                background: getGraphGradient(index),
                animationDelay: `${index * 80}ms`,
              }}
            />
          </div>
        </div>
      ))}
      {categories.length > visibleCategories.length && (
        <p className="pt-1 text-xs font-medium text-slate-400">
          แสดง {visibleCategories.length} จาก {categories.length} หมวดหมู่
        </p>
      )}
    </div>
  );
}

function FacultyDonut({ faculties }: { faculties: CategoryStat[] }) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  if (!faculties.length) return <EmptyPanel label="ยังไม่มีข้อมูลผู้เรียน" />;

  const total = faculties.reduce((sum, faculty) => sum + faculty.count, 0);
  const radius = 41;
  const circumference = 2 * Math.PI * radius;
  const percentages = faculties.map((faculty) => (total > 0 ? faculty.count / total : 0));
  const activeFaculty = hoveredSlice === null ? null : faculties[hoveredSlice];

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(170px,0.85fr)_1fr] sm:items-center">
      <div className="relative mx-auto h-48 w-48">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="สัดส่วนผู้เรียนตามหน่วยงาน"
        >
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f2f4" strokeWidth="15" />
          <defs>
            {faculties.map((_, index) => {
              const [start, end] = graphGradients[index % graphGradients.length];
              return (
                <linearGradient key={`faculty-gradient-${index}`} id={`faculty-gradient-${index}`} x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor={start} />
                  <stop offset="100%" stopColor={end} />
                </linearGradient>
              );
            })}
          </defs>
          {faculties.map((faculty, index) => {
            const percentage = percentages[index];
            const segment = Math.max(percentage * circumference - 1.5, 0);
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
                stroke={`url(#faculty-gradient-${index})`}
                strokeWidth={hoveredSlice === index ? "18" : "15"}
                strokeDasharray={`${segment} ${circumference}`}
                strokeDashoffset={-offset}
                className={`cursor-pointer transition-all duration-300 ${isDimmed ? "opacity-30" : "opacity-100"}`}
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
              className="truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400"
              title={activeFaculty?.name ?? "Learners"}
            >
              {activeFaculty?.name ?? "Learners"}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {formatNumber(activeFaculty?.count ?? total)}
            </p>
            {activeFaculty && <p className="text-[0.65rem] font-semibold text-slate-400">คน</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {faculties.slice(0, 6).map((faculty, index) => {
          const isHovered = hoveredSlice === index;
          return (
            <div
              key={`${faculty.name}-legend-${index}`}
              className={`flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors ${isHovered ? "bg-slate-50" : ""}`}
              onMouseEnter={() => setHoveredSlice(index)}
              onMouseLeave={() => setHoveredSlice(null)}
              onFocus={() => setHoveredSlice(index)}
              onBlur={() => setHoveredSlice(null)}
              tabIndex={0}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: getGraphGradient(index) }}
                />
                <span className="truncate text-xs font-semibold text-slate-600" title={faculty.name}>
                  {faculty.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-800">
                {getSharePercentage(faculty.count, total)}
              </span>
            </div>
          );
        })}
        {faculties.length > 6 && <p className="px-2 pt-1 text-xs text-slate-400">และอีก {faculties.length - 6} หน่วยงาน</p>}
      </div>
    </div>
  );
}

function CourseRanking({ courses }: { courses: CourseEnrollmentStat[] }) {
  if (!courses.length) return <EmptyPanel label="ยังไม่มีหลักสูตรที่มีการลงทะเบียน" />;

  const visibleCourses = courses.slice(0, 5);
  const maximum = Math.max(...visibleCourses.map((course) => course._count.enrollments), 1);

  return (
    <div className="space-y-2">
      {visibleCourses.map((course, index) => (
        <div
          key={course.id}
          className="group rounded-2xl border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] text-sm font-bold text-[#345ea8]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-slate-800" title={course.title}>{course.title}</p>
                <span className="shrink-0 text-xs font-bold text-slate-500">{formatNumber(course._count.enrollments)}</span>
              </div>
              <div className="mt-2 h-8 overflow-hidden rounded-md bg-slate-100">
                <div
                  className="h-full rounded-md transition-all duration-700"
                style={{ width: `${getBarScale(course._count.enrollments, maximum)}%`, background: getGraphGradient(index) }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificateBars({ certificates }: { certificates: CategoryStat[] }) {
  if (!certificates.some((certificate) => certificate.count > 0)) {
    return <EmptyPanel label="ยังไม่มีข้อมูลใบประกาศ" />;
  }

  const maximum = Math.max(...certificates.map((certificate) => certificate.count), 1);

  return (
    <div
      className="flex min-h-64 items-end justify-center gap-5 px-1 pb-1 sm:gap-10"
      aria-label="กราฟแท่งแนวตั้งแสดงจำนวนผู้เรียนที่ได้รับและยังไม่ได้รับใบประกาศ"
    >
      {certificates.map((certificate, index) => (
        <div key={certificate.name} className="flex w-36 flex-col items-center gap-2 sm:w-35">
          <span className="text-xs font-bold text-slate-700">{formatNumber(certificate.count)} คน</span>
          <div className="flex h-48 w-20 items-end overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1">
            <div
              className="stats-bar-fill stats-bar-fill--vertical w-full rounded-2xl"
              style={{
                height: `${getBarScale(certificate.count, maximum)}%`,
                background: getGraphGradient(index + 1, "0deg"),
                animationDelay: getBarDelay(index),
              }}
              aria-label={`${certificate.name}: ${formatNumber(certificate.count)} คน`}
            />
          </div>
          <span className="w-full text-center text-sm font-semibold text-slate-600">
            {certificate.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6" aria-label="กำลังโหลดข้อมูลสถิติ">
        <div className="grid gap-4 md:grid-cols-3">
          {["one", "two", "three"].map((item) => <div key={item} className={`${panelClass} h-36 animate-pulse bg-slate-100`} />)}
        </div>
        <div className={`${panelClass} h-80 animate-pulse bg-slate-100`} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${panelClass} flex min-h-80 flex-col items-center justify-center px-6 text-center`}>
        <div className="rounded-2xl bg-[#fff1ef] p-4 text-[#d85d4d]"><Activity size={28} /></div>
        <p className="mt-4 text-lg font-bold text-slate-900">ไม่สามารถโหลดข้อมูลสถิติได้</p>
        <p className="mt-1 text-sm text-slate-500">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
      </div>
    );
  }

  const totalLearnersByFaculty = stats.facultyStats.reduce((sum, faculty) => sum + faculty.count, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Learners" value={stats.userCount} detail="จำนวนผู้เรียนทั้งหมด" icon={<UsersRound size={21} />} accent="blue" />
        <StatCard label="Courses" value={stats.courseCount} detail="จำนวนหลักสูตรทั้งหมด" icon={<BookOpen size={21} />} accent="indigo" />
        <StatCard label="Enrollments" value={stats.enrollmentCount} detail="จำนวนการลงทะเบียนเรียนทั้งหมด" icon={<GraduationCap size={21} />} accent="sky" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow=" " title="หมวดหมู่การลงทะเบียน" detail="ดูว่าผู้เรียนกำลังสนใจหลักสูตรประเภทใดมากที่สุด" />
          <CategoryBars categories={stats.categoryStats} />
        </section>

        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow=" " title="ผู้เรียนตามหน่วยงาน" detail={`${formatNumber(totalLearnersByFaculty)} คนในข้อมูลปัจจุบัน`} />
          <FacultyDonut faculties={stats.facultyStats} />
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow=" " title="หลักสูตรที่มีผู้เรียนสูงสุด" detail="อันดับ Course ที่เรียนมากที่สุด" />
          <CourseRanking courses={stats.courseEnrollmentStats} />
        </section>

        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader
            eyebrow=" " title="สถานะใบประกาศของผู้เรียน"
            detail="นับผู้เรียนไม่ซ้ำคนจากหลักสูตรที่ลงทะเบียน"
          />
          <CertificateBars certificates={stats.certificateStats} />
        </section>
      </div>

      {stats.lessonCount !== undefined && (
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:px-5">
          <span className="flex items-center gap-2"><Layers3 size={15} className="text-[#315e9c]" /> Lessons ที่เผยแพร่ในระบบ</span>
          <span className="font-bold text-slate-800">{formatNumber(stats.lessonCount)} lessons</span>
        </div>
      )}
    </div>
  );
}
