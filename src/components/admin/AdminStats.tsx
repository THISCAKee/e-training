"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  GraduationCap,
  Layers3,
  UsersRound,
} from "lucide-react";
import { getBarScale, getSharePercentage } from "@/lib/stats/presentation";

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
  courseEnrollmentStats: CourseEnrollmentStat[];
};

const panelClass =
  "rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]";

const facultyColors = [
  "#0f766e",
  "#4f46e5",
  "#f5b942",
  "#0f4c5c",
  "#a855f7",
  "#ef6a5b",
  "#2f9e8f",
  "#64748b",
];

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
  accent: "teal" | "indigo" | "amber";
}) {
  const accentStyles = {
    teal: {
      icon: "bg-[#e4f4f0] text-[#0f766e]",
      dot: "bg-[#0f766e]",
      value: "text-[#0f766e]",
    },
    indigo: {
      icon: "bg-[#e9e8ff] text-[#4f46e5]",
      dot: "bg-[#4f46e5]",
      value: "text-[#4f46e5]",
    },
    amber: {
      icon: "bg-[#fff3d4] text-[#a16207]",
      dot: "bg-[#f5b942]",
      value: "text-[#a16207]",
    },
  }[accent];

  return (
    <article className={`${panelClass} group relative overflow-hidden p-5 sm:p-6`}>
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-125 ${accentStyles.dot}`}
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
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#0f766e]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
      <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold text-slate-500 sm:block">
        Live data
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
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="stats-bar-fill h-full rounded-full bg-[#0f766e]"
              style={{
                width: `${getBarScale(category.count, maximum)}%`,
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
  let currentOffset = 0;

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(170px,0.85fr)_1fr] sm:items-center">
      <div className="relative mx-auto h-48 w-48">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="สัดส่วนผู้เรียนตามหน่วยงาน"
        >
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#edf1f2" strokeWidth="15" />
          {faculties.map((faculty, index) => {
            const percentage = total > 0 ? faculty.count / total : 0;
            const segment = Math.max(percentage * circumference - 1.5, 0);
            const offset = currentOffset;
            currentOffset += percentage * circumference;
            const isDimmed = hoveredSlice !== null && hoveredSlice !== index;

            return (
              <circle
                key={`${faculty.name}-${index}`}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={facultyColors[index % facultyColors.length]}
                strokeWidth={hoveredSlice === index ? "18" : "15"}
                strokeDasharray={`${segment} ${circumference}`}
                strokeDashoffset={-offset}
                className={`cursor-pointer transition-all duration-300 ${isDimmed ? "opacity-30" : "opacity-100"}`}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">Learners</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{formatNumber(total)}</p>
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
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: facultyColors[index % facultyColors.length] }}
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef7f5] text-sm font-bold text-[#0f766e]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-slate-800" title={course.title}>{course.title}</p>
                <span className="shrink-0 text-xs font-bold text-slate-500">{formatNumber(course._count.enrollments)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#f5b942] transition-all duration-700"
                  style={{ width: `${getBarScale(course._count.enrollments, maximum)}%` }}
                />
              </div>
            </div>
            <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition-colors group-hover:text-[#0f766e]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LearningPulse({ courses }: { courses: CourseEnrollmentStat[] }) {
  if (!courses.length) return <EmptyPanel label="ยังไม่มี learning pulse" />;

  const values = courses.slice(0, 7).map((course) => course._count.enrollments);
  const maximum = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 88 - (value / maximum) * 68;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="relative h-44 overflow-hidden rounded-2xl bg-[#f0f8f6] px-3 py-4">
        <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-[#b7d8d1]" />
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-[#b7d8d1]" />
        <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-[#b7d8d1]" />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="relative h-full w-full"
          role="img"
          aria-label="แนวโน้มการลงทะเบียนหลักสูตรยอดนิยม"
        >
          <polyline
            points={points}
            fill="none"
            stroke="#0f766e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {values.map((value, index) => {
            const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
            const y = 88 - (value / maximum) * 68;
            return <circle key={`${value}-${index}`} cx={x} cy={y} r="2.6" fill="#f5b942" stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>หลักสูตรที่มีผู้เรียนสูงสุด</span>
        <span className="font-semibold text-[#0f766e]">{formatNumber(Math.max(...values))} learners</span>
      </div>
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
        <StatCard label="Learners" value={stats.userCount} detail="ผู้เรียนในขอบเขตที่คุณดูแล" icon={<UsersRound size={21} />} accent="teal" />
        <StatCard label="Courses" value={stats.courseCount} detail="หลักสูตรที่พร้อมให้ลงทะเบียน" icon={<BookOpen size={21} />} accent="indigo" />
        <StatCard label="Enrollments" value={stats.enrollmentCount} detail="การลงทะเบียนเรียนสะสม" icon={<GraduationCap size={21} />} accent="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow="Enrollment mix" title="การลงทะเบียนแยกตามหมวดหมู่" detail="ดูว่าผู้เรียนกำลังสนใจหลักสูตรประเภทใดมากที่สุด" />
          <CategoryBars categories={stats.categoryStats} />
        </section>

        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow="Learner map" title="ผู้เรียนตามหน่วยงาน" detail={`${formatNumber(totalLearnersByFaculty)} คนในข้อมูลปัจจุบัน`} />
          <FacultyDonut faculties={stats.facultyStats} />
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow="Course reach" title="หลักสูตรที่มีผู้เรียนสูงสุด" detail="จัดอันดับจากจำนวน Course Enrollment สะสม" />
          <CourseRanking courses={stats.courseEnrollmentStats} />
        </section>

        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow="Learning pulse" title="จังหวะการเรียนรู้" detail="ภาพรวม reach ของหลักสูตรยอดนิยม" />
          <LearningPulse courses={stats.courseEnrollmentStats} />
        </section>
      </div>

      {stats.lessonCount !== undefined && (
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:px-5">
          <span className="flex items-center gap-2"><Layers3 size={15} className="text-[#0f766e]" /> Lessons ที่เผยแพร่ในระบบ</span>
          <span className="font-bold text-slate-800">{formatNumber(stats.lessonCount)} lessons</span>
        </div>
      )}
    </div>
  );
}
