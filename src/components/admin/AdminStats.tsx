"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  GraduationCap,
  Layers3,
  ListChecks,
  Podcast,
  UsersRound,
} from "lucide-react";
import type {
  AdminStatsCategory,
  AdminStatsGroup,
  AdminStatsResponse,
  CourseEnrollmentStat,
} from "@/lib/stats/admin-dashboard";
import {
  getBarDelay,
  getBarScale,
  getSharePercentage,
} from "@/lib/stats/presentation";

type CategoryStat = AdminStatsGroup;
type PodcastViewStat = NonNullable<AdminStatsResponse["analytics"]["podcastViews"]>[number];
type StatCardData = {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  accent: "blue" | "indigo" | "sky";
};
type RecentRow = {
  title: string;
  status?: string;
  date: string;
};

const panelClass =
  "admin-glass-card rounded-[1.35rem] border";

const graphGradients = [
  ["#003049", "#34758f"],
  ["#d62828", "#ed6d66"],
  ["#f77f00", "#ffad52"],
  ["#fcbf49", "#ffde91"],
  ["#17607a", "#8eb9ca"],
  ["#d96f00", "#ffd09d"],
] as const;

function getGraphGradient(index: number, direction: "0deg" | "90deg" = "90deg") {
  const [start, end] = graphGradients[index % graphGradients.length];
  return `linear-gradient(${direction}, ${start}, ${end})`;
}

const formatNumber = (value: number) => value.toLocaleString("th-TH");
const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(
    new Date(value),
  );

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
      icon: "bg-[#eaf2f5] text-[#003049]",
      glow: "from-[#003049]/10 via-[#eaf2f5]/55 to-white/0",
      value: "text-slate-900",
    },
    indigo: {
      icon: "bg-[#fff4e7] text-[#d96f00]",
      glow: "from-[#f77f00]/12 via-[#fff4e7]/55 to-white/0",
      value: "text-slate-900",
    },
    sky: {
      icon: "bg-[#fff1f0] text-[#d62828]",
      glow: "from-[#d62828]/10 via-[#fff1f0]/55 to-white/0",
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
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#003049]">
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

function RecentPanel({
  title,
  detail,
  rows,
  emptyLabel,
}: {
  title: string;
  detail: string;
  rows: RecentRow[];
  emptyLabel: string;
}) {
  return (
    <section className={`${panelClass} p-5 sm:p-6`}>
      <PanelHeader eyebrow="RECENT" title={title} detail={detail} />
      {rows.length ? (
        <ul className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li
              key={`${row.title}-${row.date}-${index}`}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800" title={row.title}>
                  {row.title}
                </p>
                <time dateTime={row.date} className="mt-1 block text-xs text-slate-400">
                  {formatDate(row.date)}
                </time>
              </div>
              {row.status && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-600">
                  {row.status}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="admin-glass-card--soft flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-center">
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        </div>
      )}
    </section>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="admin-glass-card--soft flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-5 text-center">
      <div className="rounded-2xl bg-[#fff4e7] p-3 text-[#f77f00]">
        <BarChart3 size={22} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-xs text-slate-400">ข้อมูลจะแสดงเมื่อมีการใช้งาน</p>
    </div>
  );
}

function CategoryBars({ categories }: { categories: AdminStatsCategory[] }) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!categories.length) return <EmptyPanel label="ยังไม่มีข้อมูลหมวดหมู่" />;

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);
  const maximum = Math.max(...visibleCategories.map((category) => category.count), 1);

  return (
    <div className="space-y-5">
      {categories.length > 6 && (
        <div className="flex justify-end">
          <button
            type="button"
            aria-expanded={showAllCategories}
            aria-controls="category-bars-list"
            onClick={() => setShowAllCategories((showingAll) => !showingAll)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#003049] transition-colors hover:bg-[#fcbf49]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f77f00]"
          >
            {showAllCategories ? "แสดงเฉพาะหมวดหมู่ยอดนิยม" : `แสดงทุกหมวดหมู่ (${categories.length})`}
            {showAllCategories ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      )}
      <div
        id="category-bars-list"
        className={`space-y-5 ${showAllCategories ? "max-h-[32rem] overflow-y-auto pr-1" : ""}`}
      >
        {visibleCategories.map((category, index) => {
          const expanded = expandedCategories[category.name] ?? false;
          const courseMaximum = Math.max(...category.courses.map((course) => course.count), 1);
          const courseListId = `category-courses-${index}`;

          return (
            <div key={`${category.name}-${index}`} className="rounded-xl">
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="min-w-0 truncate font-semibold text-slate-700" title={category.name}>
                  {category.name}
                </span>
                <span className="shrink-0 font-bold text-slate-900">
                  {formatNumber(category.count)} การลงทะเบียน
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
              {category.courses.length > 0 && (
                <>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={courseListId}
                    onClick={() => setExpandedCategories((current) => ({
                      ...current,
                      [category.name]: !expanded,
                    }))}
                    className="mt-2 inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[#003049] transition-colors hover:bg-[#fcbf49]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f77f00]"
                  >
                    {expanded ? "ซ่อนคอร์ส" : `แสดง ${category.courses.length} คอร์ส`}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <ul
                    id={courseListId}
                    hidden={!expanded}
                    className="mt-2 max-h-64 space-y-2 overflow-y-auto border-l-2 border-slate-100 pl-3"
                  >
                    {category.courses.map((course) => (
                      <li key={course.id} className="admin-glass-card--soft rounded-lg border px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-xs font-medium text-slate-600" title={course.title}>
                            {course.title}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-slate-700">
                            {formatNumber(course.count)} คน
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                          <div
                            className="stats-bar-fill h-full rounded-full"
                            style={{
                              width: `${getBarScale(course.count, courseMaximum)}%`,
                              background: getGraphGradient(index),
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FacultyDonut({ faculties }: { faculties: CategoryStat[] }) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  if (!faculties.length) return <EmptyPanel label="ยังไม่มีข้อมูลผู้เรียน" />;

  const total = faculties.reduce((sum, faculty) => sum + faculty.count, 0);
  const radius = 48;
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
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e1e9ed" strokeWidth="15" />
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
  const [showAllCourses, setShowAllCourses] = useState(false);

  if (!courses.length) return <EmptyPanel label="ยังไม่มีหลักสูตรที่มีการลงทะเบียน" />;

  const visibleCourses = showAllCourses ? courses : courses.slice(0, 5);
  const maximum = Math.max(...visibleCourses.map((course) => course._count.enrollments), 1);

  return (
    <div className="space-y-2">
      {courses.length > 5 && (
        <div className="flex items-center justify-between gap-3 px-3 pb-1">
          <p className="text-xs font-medium text-slate-400">
            {showAllCourses
              ? `แสดงทั้งหมด ${courses.length} หลักสูตร`
              : `5 อันดับแรก จาก ${courses.length} หลักสูตร`}
          </p>
          <button
            type="button"
            aria-expanded={showAllCourses}
            aria-controls="course-ranking-list"
            onClick={() => setShowAllCourses((showingAll) => !showingAll)}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#003049] transition-colors hover:bg-[#fcbf49]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f77f00]"
          >
            {showAllCourses ? "แสดง 5 อันดับแรก" : "แสดงทั้งหมด"}
            {showAllCourses ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      )}
      <div
        id="course-ranking-list"
        className={`space-y-2 ${showAllCourses ? "max-h-[32rem] overflow-y-auto pr-1" : ""}`}
      >
        {visibleCourses.map((course, index) => (
          <div
            key={course.id}
            className="admin-glass-card--soft group rounded-2xl border p-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eaf2f5] text-sm font-bold text-[#003049]">
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
    </div>
  );
}

function parsePodcastViewCount(value: string | null): bigint | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function PodcastViewsPanel({ videos }: { videos: PodcastViewStat[] }) {
  const [showAllVideos, setShowAllVideos] = useState(false);

  if (!videos.length) {
    return (
      <section className={`${panelClass} p-5 sm:p-6`}>
        <PanelHeader eyebrow="PODCAST VIEWS" title="ยอดชม Podcast" detail="ยอดชมสะสมของวิดีโอแต่ละรายการจาก YouTube" />
        <EmptyPanel label="ยังไม่มีวิดีโอ Podcast" />
      </section>
    );
  }

  const rows = videos.map((video) => ({ video, count: parsePodcastViewCount(video.viewCount) }));
  const totalViews = rows.reduce(
    (total, row) => total + (row.count ?? BigInt(0)),
    BigInt(0),
  );
  const videosWithViews = rows.filter((row) => row.count !== null).length;
  const visibleRows = showAllVideos ? rows : rows.slice(0, 5);

  return (
    <section className={`${panelClass} p-5 sm:p-6`}>
      <div className="flex flex-col gap-5 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#003049]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f77f00]" aria-hidden="true" />
            PODCAST VIEWS
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">ยอดชม Podcast</h2>
          <p className="mt-1 text-sm text-slate-500">เปรียบเทียบยอดชมสะสมของแต่ละวิดีโอจาก YouTube</p>
        </div>
        <div className="rounded-2xl border border-[#fcbf49]/55 bg-white px-4 py-3 sm:min-w-52 sm:text-right">
          <p className="text-xs font-semibold text-slate-500">ยอดชมรวม</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[#003049]">
            {videosWithViews > 0 ? totalViews.toLocaleString("th-TH") : "—"}
          </p>
          <p className="mt-0.5 text-[0.68rem] text-slate-400">
            มีข้อมูล {formatNumber(videosWithViews)} / {formatNumber(videos.length)} วิดีโอ
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">รายการยอดชม Podcast</h3>
            <p className="mt-0.5 text-xs text-slate-400">เรียงจากวิดีโอที่มียอดชมสูงสุด</p>
          </div>
          <span className="text-xs font-medium text-slate-400">{formatNumber(videos.length)} วิดีโอ</span>
        </div>

        <div
          id="podcast-view-ranking-list"
          className={`overflow-hidden rounded-xl border border-slate-200 ${showAllVideos ? "max-h-[32rem] overflow-y-auto" : ""}`}
        >
          <table className="w-full table-fixed text-left" aria-label="ยอดชม Podcast แยกตามวิดีโอ">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th scope="col" className="w-12 px-2 py-3 sm:w-16 sm:px-4">อันดับ</th>
                <th scope="col" className="px-2 py-3 sm:px-4">วิดีโอ Podcast</th>
                <th scope="col" className="hidden w-32 px-4 py-3 md:table-cell">สถานะ</th>
                <th scope="col" className="w-24 px-2 py-3 text-right sm:w-32 sm:px-4">ยอดชม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white">
              {visibleRows.map(({ video, count }, index) => (
                <tr key={video.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-2 py-3 text-xs font-bold tabular-nums text-slate-500 sm:px-4">
                    {count === null ? "—" : String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    <p className="line-clamp-2 break-words text-sm font-semibold text-slate-800" title={video.title}>{video.title}</p>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[0.62rem] font-semibold md:hidden ${video.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {video.isPublished ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${video.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {video.isPublished ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right text-sm font-bold tabular-nums text-slate-700 sm:px-4">
                    {count?.toLocaleString("th-TH") ?? <span className="font-medium text-slate-400" title="ไม่พบข้อมูลยอดชมจาก YouTube">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length > 5 && (
          <button
            type="button"
            aria-expanded={showAllVideos}
            aria-controls="podcast-view-ranking-list"
            onClick={() => setShowAllVideos((showingAll) => !showingAll)}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#003049] transition-colors hover:bg-[#fcbf49]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f77f00]"
          >
            {showAllVideos ? "ย่อรายการ" : `ดูวิดีโอทั้งหมด (${formatNumber(rows.length)})`}
            {showAllVideos ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>
    </section>
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
          <div className="admin-glass-card--soft flex h-48 w-20 items-end overflow-hidden rounded-2xl border p-1">
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
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = (await res.json()) as AdminStatsResponse;
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className={`${panelClass} h-36 animate-pulse`} />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <div className={`${panelClass} h-64 animate-pulse`} />
          <div className={`${panelClass} h-64 animate-pulse`} />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${panelClass} flex min-h-80 flex-col items-center justify-center px-6 text-center`}>
        <div className="rounded-2xl bg-[#fff1f0] p-4 text-[#d62828]"><Activity size={28} /></div>
        <p className="mt-4 text-lg font-bold text-slate-900">ไม่สามารถโหลดข้อมูลสถิติได้</p>
        <p className="mt-1 text-sm text-slate-500">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
      </div>
    );
  }

  const totalLearnersByFaculty = stats.analytics.facultyStats.reduce(
    (sum, faculty) => sum + faculty.count,
    0,
  );
  const isSystemAdmin = stats.scope.type === "system";
  const statCards: StatCardData[] = [
    {
      label: "ผู้เรียน",
      value: stats.counts.learners,
      detail: "บัญชีผู้เรียนตามขอบเขตสิทธิ์",
      icon: <UsersRound size={21} />,
      accent: "blue",
    },
    ...(isSystemAdmin && stats.counts.organizations !== undefined
      ? [
          {
            label: "หน่วยงาน",
            value: stats.counts.organizations,
            detail: "หน่วยงานทั้งหมดในระบบ",
            icon: <Building2 size={21} />,
            accent: "indigo" as const,
          },
        ]
      : []),
    {
      label: "หลักสูตร",
      value: stats.counts.courses,
      detail: "หลักสูตรในขอบเขตสิทธิ์",
      icon: <BookOpen size={21} />,
      accent: "indigo",
    },
    {
      label: "หมวดหมู่",
      value: stats.counts.categories,
      detail: "หมวดหมู่ที่มีหลักสูตรในขอบเขต",
      icon: <Layers3 size={21} />,
      accent: "sky",
    },
    {
      label: "บทเรียน",
      value: stats.counts.lessons,
      detail: "บทเรียนในหลักสูตรที่ดูแล",
      icon: <BookOpen size={21} />,
      accent: "blue",
    },
    {
      label: "แบบทดสอบ",
      value: stats.counts.quizzes,
      detail: "แบบทดสอบในบทเรียนที่ดูแล",
      icon: <Activity size={21} />,
      accent: "indigo",
    },
    {
      label: "คำถาม",
      value: stats.counts.questions,
      detail: "จำนวนคำถามทั้งหมด",
      icon: <CircleHelp size={21} />,
      accent: "sky",
    },
    {
      label: "ตัวเลือกคำตอบ",
      value: stats.counts.options,
      detail: "นับจำนวนเท่านั้น ไม่แสดงข้อความคำตอบ",
      icon: <ListChecks size={21} />,
      accent: "blue",
    },
    {
      label: "การลงทะเบียน",
      value: stats.counts.enrollments.total,
      detail: `กำลังเรียน ${formatNumber(stats.counts.enrollments.inProgress)} · เรียนจบ ${formatNumber(stats.counts.enrollments.completed)}`,
      icon: <GraduationCap size={21} />,
      accent: "indigo",
    },
    {
      label: "ความคืบหน้าบทเรียน",
      value: stats.counts.lessonProgress.total,
      detail: `เรียนจบแล้ว ${formatNumber(stats.counts.lessonProgress.completed)} รายการ`,
      icon: <Layers3 size={21} />,
      accent: "sky",
    },
    {
      label: "การทำแบบทดสอบ",
      value: stats.counts.quizAttempts.total,
      detail: `ผ่าน ${formatNumber(stats.counts.quizAttempts.passed)} ครั้ง`,
      icon: <BarChart3 size={21} />,
      accent: "blue",
    },
    ...(isSystemAdmin && stats.counts.podcasts
      ? [
          {
            label: "Podcast",
            value: stats.counts.podcasts.total,
            detail: `เผยแพร่แล้ว ${formatNumber(stats.counts.podcasts.published)} ตอน`,
            icon: <Podcast size={21} />,
            accent: "indigo" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className={`${panelClass} flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-slate-500 sm:px-5`}>
        <span>
          ขอบเขตข้อมูล: {stats.scope.type === "system" ? "ทั้งระบบ" : "หน่วยงานที่ดูแล"}
        </span>
        <time dateTime={stats.generatedAt}>
          อัปเดต {formatDateTime(stats.generatedAt)}
        </time>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow=" " title="หมวดหมู่การลงทะเบียน" detail="จำนวนผู้ลงทะเบียนแยกตามหมวดหมู่และคอร์ส" />
          <CategoryBars categories={stats.analytics.categoryStats} />
        </section>

        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow=" " title="ผู้เรียนตามหน่วยงาน" detail={`${formatNumber(totalLearnersByFaculty)} คนในข้อมูลปัจจุบัน`} />
          <FacultyDonut faculties={stats.analytics.facultyStats} />
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader eyebrow=" " title="หลักสูตรที่มีผู้เรียนสูงสุด" detail="อันดับ Course ที่เรียนมากที่สุด" />
          <CourseRanking courses={stats.analytics.courseEnrollmentStats} />
        </section>

        <section className={`${panelClass} p-5 sm:p-6`}>
          <PanelHeader
            eyebrow=" " title="สถานะใบประกาศของผู้เรียน"
            detail="นับผู้เรียนไม่ซ้ำคนจากหลักสูตรที่ลงทะเบียน"
          />
          <CertificateBars certificates={stats.analytics.certificateStats} />
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        {isSystemAdmin && stats.analytics.podcastViews !== undefined && (
          <div className="xl:col-span-2">
            <PodcastViewsPanel videos={stats.analytics.podcastViews} />
          </div>
        )}
      </div>
    </div>
  );
}
