"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trophy,
  UsersRound,
} from "lucide-react";

type CourseEnrollmentStat = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  category: { name: string } | null;
  _count: {
    enrollments: number;
  };
};

type Stats = {
  courseEnrollmentStats: CourseEnrollmentStat[];
};

const rankStyles = [
  "bg-[#fcbf49] text-[#003049]",
  "bg-[#b35900] text-white",
  "bg-[#d62828] text-white",
] as const;

function formatNumber(value: number) {
  return value.toLocaleString("th-TH");
}

function CourseImage({ course }: { course: CourseEnrollmentStat }) {
  const [hasError, setHasError] = useState(false);

  if (!course.imageUrl || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f6f8fa] text-[#b35900]">
        <BookOpen aria-hidden="true" size={34} strokeWidth={1.7} />
      </div>
    );
  }

  return (
    <Image
      src={course.imageUrl}
      alt={course.title}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      onError={() => setHasError(true)}
    />
  );
}

function EnrollmentCount({ count, prominent = false }: { count: number; prominent?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${prominent ? "text-white" : "text-[#476273]"}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${prominent ? "bg-white/15 text-[#fcbf49]" : "bg-[#fff4e4] text-[#b35900]"}`}>
        <UsersRound aria-hidden="true" size={17} />
      </span>
      <p className="text-sm font-semibold">
        <span className={`mr-1 text-xl font-bold tracking-tight ${prominent ? "text-white" : "text-[#003049]"}`}>
          {formatNumber(count)}
        </span>
        คนเข้าเรียน
      </p>
    </div>
  );
}

function FeaturedCourse({ course }: { course: CourseEnrollmentStat }) {
  return (
    <article className="group relative min-h-[24rem] overflow-hidden rounded-2xl bg-[#003049] transition duration-300 sm:min-h-[31rem]">
        <div className="absolute inset-0">
          <CourseImage course={course} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1b2d] via-[#003049]/60 to-[#003049]/5" />
        <div className="relative flex min-h-[24rem] flex-col justify-between p-5 sm:min-h-[31rem] sm:p-7">
          <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold tracking-wide ${rankStyles[0]}`}>
            <Trophy aria-hidden="true" size={18} /> อันดับ 1
          </span>
          <div className="max-w-xl">
            <h2 className="mt-2 line-clamp-2 text-2xl font-bold leading-snug text-white sm:text-3xl" title={course.title}>
              {course.title}
            </h2>
            <div className="mt-5 border-t border-white/20 pt-4">
              <EnrollmentCount count={course._count.enrollments} prominent />
            </div>
          </div>
        </div>
    </article>
  );
}

function RankedCourse({
  course,
  rank,
  stretch = false,
}: {
  course: CourseEnrollmentStat;
  rank: number;
  stretch?: boolean;
}) {
  return (
    <article className={`group grid min-h-40 grid-cols-[7rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#e6ebef] bg-white transition duration-300 sm:min-h-[15rem] sm:grid-cols-[10rem_minmax(0,1fr)] ${stretch ? "flex-1" : ""}`}>
        <div className="relative min-h-full overflow-hidden bg-[#f6f8fa]">
          <CourseImage course={course} />
          <span className={`absolute left-3 top-3 z-10 flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold shadow-sm ${rankStyles[rank - 1]}`}>
            {String(rank).padStart(2, "0")}
          </span>
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="text-sm text-[#b35900]">อันดับ {rank}</p>
            <h3 className="mt-2 line-clamp-3 text-base font-semibold leading-snug text-[#003049] sm:text-lg" title={course.title}>
              {course.title}
            </h3>
          </div>
          <EnrollmentCount count={course._count.enrollments} />
        </div>
    </article>
  );
}

function AllCoursesCarousel({ courses }: { courses: CourseEnrollmentStat[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const scrollPeriod = useRef(0);
  const dragStart = useRef<{ x: number; scrollLeft: number; moved: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [repeatCount, setRepeatCount] = useState(3);

  const startDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressClickUntil.current = 0;
    dragStart.current = {
      x: event.pageX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    };
    setIsDragging(true);
  };

  const moveDrag = (event: MouseEvent<HTMLDivElement>) => {
    const drag = dragStart.current;
    if (!drag) return;

    const distance = event.pageX - drag.x;
    if (Math.abs(distance) > 4) drag.moved = true;
    if (!drag.moved) return;

    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  };

  const finishDrag = () => {
    const drag = dragStart.current;
    if (!drag) return;
    if (drag.moved) suppressClickUntil.current = Date.now() + 180;
    dragStart.current = null;
    setIsDragging(false);
  };

  const suppressDraggedClick = (event: MouseEvent<HTMLDivElement>) => {
    if (Date.now() >= suppressClickUntil.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const scrollByCards = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * Math.round(carousel.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    const firstSet = firstSetRef.current;
    if (!carousel || !firstSet) return;

    const updateDimensions = () => {
      const period = firstSet.getBoundingClientRect().width;
      if (period <= 0) return;

      scrollPeriod.current = period;
      setRepeatCount(Math.max(2, Math.ceil((carousel.clientWidth + period) / period)));
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(carousel);
    resizeObserver.observe(firstSet);

    return () => resizeObserver.disconnect();
  }, [courses.length]);

  useEffect(() => {
    if (isHovered || isFocused || isDragging) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationFrame = 0;
    let previousTime = 0;
    let position = carousel.scrollLeft;
    const pixelsPerMillisecond = 0.032;

    const advance = (time: number) => {
      if (previousTime > 0) {
        const elapsed = Math.min(time - previousTime, 50);
        const period = scrollPeriod.current;
        if (period > 0) {
          position = (position + elapsed * pixelsPerMillisecond) % period;
          carousel.scrollLeft = position;
        }
      }

      previousTime = time;
      animationFrame = window.requestAnimationFrame(advance);
    };

    animationFrame = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isDragging, isFocused, isHovered, repeatCount]);

  return (
    <section
      aria-labelledby="all-courses-heading"
      className="mt-10 sm:mt-14"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        finishDrag();
      }}
    >
      <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="all-courses-heading" className="text-xl font-bold tracking-tight text-[#003049] sm:text-2xl">คอร์สเรียนทั้งหมด</h2>
          <p className="mt-1 text-sm text-[#718895]">ดูรายละเอียดและจำนวนผู้เข้าเรียนของแต่ละคอร์ส</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="เลื่อนคอร์สไปทางซ้าย"
              onClick={() => scrollByCards(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6ebef] bg-white text-[#003049] transition hover:border-[#b35900] hover:bg-[#fff8ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b35900]"
            >
              <ChevronLeft aria-hidden="true" size={19} />
            </button>
            <button
              type="button"
              aria-label="เลื่อนคอร์สไปทางขวา"
              onClick={() => scrollByCards(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6ebef] bg-white text-[#003049] transition hover:border-[#b35900] hover:bg-[#fff8ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b35900]"
            >
              <ChevronRight aria-hidden="true" size={19} />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={carouselRef}
        role="region"
        aria-label="รายการคอร์สเรียนทั้งหมด เลื่อนในแนวนอน"
        tabIndex={0}
        className={`course-carousel flex overflow-x-auto overscroll-x-contain touch-pan-x pb-5 ${isDragging ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"} select-none`}
        onMouseDown={startDrag}
        onMouseMove={moveDrag}
        onMouseUp={finishDrag}
        onMouseLeave={finishDrag}
        onFocus={() => setIsFocused(true)}
        onBlur={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
            setIsFocused(false);
          }
        }}
        onClickCapture={suppressDraggedClick}
        onDragStart={(event) => event.preventDefault()}
      >
        {Array.from({ length: repeatCount }, (_, groupIndex) => (
          <div
            key={`course-set-${groupIndex}`}
            ref={groupIndex === 0 ? firstSetRef : undefined}
            aria-hidden={groupIndex > 0 ? true : undefined}
            className="flex flex-none gap-4 pr-4 sm:gap-5 sm:pr-5"
          >
            {courses.map((course, index) => (
              <Link
                key={`${groupIndex}-${course.id}`}
                href={`/courses/${course.id}`}
                draggable={false}
                prefetch={groupIndex === 0 ? undefined : false}
                tabIndex={groupIndex > 0 ? -1 : undefined}
                className={`${groupIndex === 0 ? "course-card-arrive" : ""} group flex w-[82vw] max-w-[22rem] flex-none flex-col overflow-hidden rounded-2xl border border-[#e6ebef] bg-white transition-[transform,box-shadow,border-color] duration-300 hover:border-[#fcbf49] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b35900]`}
                style={groupIndex === 0 ? { animationDelay: `${Math.min(index * 60, 360)}ms` } : undefined}
              >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f6f8fa]">
              <CourseImage course={course} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#003049]/30 to-transparent" />
            </div>
            <div className="flex min-h-[17rem] flex-1 flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                {course.category?.name ? (
                  <span className="max-w-[58%] truncate rounded-full bg-[#fff4e4] px-3 py-1.5 text-xs font-bold text-[#a85a00]" title={course.category.name}>
                    {course.category.name}
                  </span>
                ) : <span />}
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold tabular-nums text-[#536b79]">
                  <UsersRound aria-hidden="true" size={16} className="text-[#b35900]" />
                  {formatNumber(course._count.enrollments)}
                  <span className="text-xs font-medium">คน</span>
                </span>
              </div>
              <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-[#003049]" title={course.title}>
                {course.title}
              </h3>
              {course.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#718895]">
                  {course.description}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-[#edf1f3] pt-5">
                <span className="text-sm font-bold text-[#476273]">ดูรายละเอียดคอร์ส</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f7f8] text-[#b35900] transition-[background-color,color,transform] duration-200 group-hover:translate-x-0.5 group-hover:bg-[#b35900] group-hover:text-white">
                  <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
                </span>
              </div>
            </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CourseCarouselEmptyState() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#cbd9e1] bg-white px-6 text-center">
      <div>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4e4] text-[#b35900]">
          <BookOpen aria-hidden="true" size={25} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-[#003049]">ยังไม่มีคอร์สในระบบ</h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-[#718895]">คอร์สที่เปิดสอนจะแสดงที่นี่พร้อมจำนวนผู้เข้าเรียน</p>
      </div>
    </div>
  );
}

function PopularEmptyState() {
  return (
    <div className="flex min-h-52 items-center gap-4 rounded-2xl border border-dashed border-[#cbd9e1] bg-white px-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff4e4] text-[#b35900]">
        <Trophy aria-hidden="true" size={22} />
      </span>
      <div>
        <h3 className="font-bold text-[#003049]">ยังไม่มีคอร์สที่มีผู้เข้าเรียน</h3>
        <p className="mt-1 text-sm text-[#718895]">คอร์สยอดนิยมจะแสดงที่นี่เมื่อมีผู้เรียนลงทะเบียน</p>
      </div>
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
      <main className="min-h-screen bg-[#f5f7f8] px-4 py-10 sm:px-6 sm:py-14" aria-busy="true">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 space-y-3">
            <div className="h-3 w-32 rounded bg-[#e6ebef]" />
            <div className="h-9 w-64 rounded-lg bg-[#e6ebef]" />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="min-h-96 rounded-2xl bg-[#e6ebef]" />
            <div className="space-y-5">
              <div className="h-60 rounded-2xl bg-white" />
              <div className="h-60 rounded-2xl bg-white" />
            </div>
          </div>
          <div className="mt-10">
            <div className="mb-4 h-7 w-48 rounded-lg bg-[#e6ebef]" />
            <div className="flex gap-5 overflow-hidden">
              <div className="h-[29rem] w-[82vw] max-w-[22rem] flex-none rounded-2xl bg-white" />
              <div className="h-[29rem] w-[82vw] max-w-[22rem] flex-none rounded-2xl bg-white" />
              <div className="h-[29rem] w-[82vw] max-w-[22rem] flex-none rounded-2xl bg-white" />
            </div>
          </div>
        </div>
        <p className="sr-only">กำลังโหลดข้อมูลคอร์ส...</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7f8] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f0] text-[#d62828]">
          <BookOpen aria-hidden="true" size={25} />
        </div>
        <h1 className="mt-5 text-xl font-bold text-[#003049]">ยังโหลดข้อมูลคอร์สไม่ได้</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#718895]">ตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง</p>
        <button
          type="button"
          onClick={retry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003049] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174d66] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#b35900]"
        >
          <RefreshCw aria-hidden="true" size={16} /> ลองโหลดอีกครั้ง
        </button>
      </main>
    );
  }

  const courses = stats.courseEnrollmentStats ?? [];
  const popularCourses = courses.filter((course) => course._count.enrollments > 0).slice(0, 3);
  const totalEnrollmentCount = courses.reduce(
    (total, course) => total + course._count.enrollments,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f5f7f8] px-4 py-10 text-[#003049] sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#003049] sm:text-4xl">ข้อมูลและสถิติคอร์สเรียน</h1>
            <p className="mt-2 text-sm text-[#718895] sm:text-base">อันดับคอร์สยอดนิยมและจำนวนผู้เข้าเรียนของทุกคอร์ส</p>
          </div>
          <div className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-[#003049] px-4 py-3.5 text-white sm:w-auto sm:min-w-[14rem]">
            <div className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full border border-[#fcbf49]/30 transition-transform duration-500 group-hover:scale-125" />
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#fcbf49]">
              <UsersRound aria-hidden="true" size={20} />
            </span>
            <div className="relative min-w-0 flex-1 text-right">
              <p className="text-xs font-semibold text-white/70">จำนวนผู้เข้าเรียน</p>
              <p className="mt-0.5 flex items-baseline justify-end gap-2">
                <span className="text-2xl font-bold tracking-tight">{formatNumber(totalEnrollmentCount)}</span>
                <span className="text-sm font-normal text-[#fcbf49] text-right">ครั้ง</span>
              </p>
            </div>
          </div>
        </header>

        {courses.length > 0 && (
          <section aria-labelledby="popular-courses-heading">
            <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="popular-courses-heading" className="mt-1 text-xl font-bold tracking-tight text-[#003049] sm:text-2xl">คอร์สยอดนิยม 3 อันดับ</h2>
              </div>
              <p className="text-xs font-medium text-[#718895]">เรียงจากจำนวนผู้เข้าเรียนมากไปน้อย</p>
            </div>

            {popularCourses.length > 0 ? (
              <div className={`grid gap-5 ${popularCourses.length > 1 ? "lg:grid-cols-[1.05fr_0.95fr]" : "mx-auto max-w-3xl"}`}>
                <FeaturedCourse course={popularCourses[0]} />
                {popularCourses.length > 1 ? (
                  <div className="flex flex-col gap-5">
                    {popularCourses.slice(1, 3).map((course, index) => (
                      <RankedCourse key={course.id} course={course} rank={index + 2} stretch={popularCourses.length === 2} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <PopularEmptyState />
            )}
          </section>
        )}

        {courses.length > 0 ? (
          <AllCoursesCarousel courses={courses} />
        ) : (
          <section aria-labelledby="all-courses-heading" className="mt-10">
            <h2 id="all-courses-heading" className="mb-5 text-xl font-bold text-[#003049]">คอร์สเรียนทั้งหมด</h2>
            <CourseCarouselEmptyState />
          </section>
        )}
      </div>
    </main>
  );
}
