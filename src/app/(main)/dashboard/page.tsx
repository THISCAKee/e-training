// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  User,
  BarChart3,
  Star,
  Play,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = parseInt(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      studentId: true,
      name: true,
      email: true,
      faculty: true,
      program: true,
      major: true,
      year: true,
    },
  });

  const enrollments = await prisma.userCourseEnrollment.findMany({
    where: { userId: userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          _count: { select: { lessons: true } },
        },
      },
      user: {
        select: {
          quizAttempts: {
            where: { passed: true },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              quizId: true,
              quiz: {
                select: {
                  lesson: {
                    select: {
                      courseId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const passedAttempts = await prisma.quizAttempt.findMany({
    where: { userId: userId, passed: true },
    orderBy: { createdAt: "desc" },
    include: {
      quiz: {
        include: {
          lesson: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === "IN_PROGRESS"
  ).length;
  const totalCertificates = passedAttempts.length;

  const allQuizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: userId },
    select: { score: true, passed: true },
  });

  const totalQuizAttempts = allQuizAttempts.length;
  const passedQuizAttempts = allQuizAttempts.filter((a) => a.passed).length;
  const averageScore =
    totalQuizAttempts > 0
      ? (
          allQuizAttempts.reduce((sum, a) => sum + a.score, 0) /
          totalQuizAttempts
        ).toFixed(1)
      : 0;

  const passRate =
    totalQuizAttempts > 0
      ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
      : 0;

  const latestPassedAttemptByCourse = new Map();
  enrollments.forEach((enroll) => {
    if (enroll.user?.quizAttempts && enroll.user.quizAttempts.length > 0) {
      const attempt = enroll.user.quizAttempts[0];
      if (attempt.quiz?.lesson?.courseId === enroll.courseId) {
        latestPassedAttemptByCourse.set(enroll.courseId, attempt);
      }
    }
  });

  const completionRate =
    totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  return (
    <div style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)", minHeight: "100vh" }}>
      <div className="container mx-auto py-8 px-4 max-w-7xl">

        {/* ===== HERO PROFILE SECTION ===== */}
        <div
          className="rounded-3xl p-8 mb-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%)",
            boxShadow: "0 20px 60px rgba(79,70,229,0.35)",
          }}
        >
          {/* decorative circles */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
          <div style={{ position:"absolute", bottom:"-40px", left:"30%", width:"150px", height:"150px", borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative">
            {/* Avatar */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-2xl"
              style={{
                width: "80px",
                height: "80px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <User size={40} className="text-white" />
            </div>

            {/* Info */}
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{session.user.name}</h1>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  นิสิต
                </span>
              </div>
              <p className="text-indigo-200 mb-4">รหัสนิสิต: {user?.studentId || "-"}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "คณะ", value: user?.faculty || "-" },
                  { label: "สาขา", value: user?.major || "-" },
                  { label: "หลักสูตร", value: user?.program || "-" },
                  { label: "ชั้นปี", value: user?.year ? `ปีที่ ${user.year}` : "-" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
                  >
                    <p style={{ color: "rgba(199,210,254,1)", fontSize: "11px", marginBottom: "2px" }}>{item.label}</p>
                    <p className="text-white font-semibold text-sm truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress ring summary */}
            <div
              className="flex-shrink-0 text-center rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", minWidth: "120px" }}
            >
              <p style={{ color: "rgba(199,210,254,1)", fontSize: "12px", marginBottom: "4px" }}>ความคืบหน้า</p>
              <p className="text-4xl font-black text-white">{completionRate}%</p>
              <p style={{ color: "rgba(167,243,208,1)", fontSize: "12px", marginTop: "4px" }}>เรียนจบแล้ว</p>
            </div>
          </div>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "หลักสูตรทั้งหมด",
              value: totalCourses,
              icon: <BookOpen size={28} />,
              gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              bg: "#eff6ff",
              iconColor: "#3b82f6",
            },
            {
              label: "กำลังเรียน",
              value: inProgressCourses,
              icon: <TrendingUp size={28} />,
              gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
              bg: "#fffbeb",
              iconColor: "#f59e0b",
            },
            {
              label: "เรียนจบแล้ว",
              value: completedCourses,
              icon: <CheckCircle size={28} />,
              gradient: "linear-gradient(135deg, #10b981, #059669)",
              bg: "#f0fdf4",
              iconColor: "#10b981",
            },
            {
              label: "ใบประกาศฯ",
              value: totalCertificates,
              icon: <GraduationCap size={28} />,
              gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              bg: "#faf5ff",
              iconColor: "#8b5cf6",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div
                className="inline-flex items-center justify-center rounded-xl mb-3"
                style={{ width: "52px", height: "52px", background: card.bg }}
              >
                <span style={{ color: card.iconColor }}>{card.icon}</span>
              </div>
              <p className="text-gray-500 text-sm mb-1">{card.label}</p>
              <p className="text-4xl font-black" style={{ background: card.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ===== QUIZ STATS ===== */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl" style={{ background: "#eff6ff" }}>
              <BarChart3 size={22} style={{ color: "#3b82f6" }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">สถิติการทำแบบทดสอบ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total attempts */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">จำนวนครั้งทั้งหมด</p>
              <p className="text-4xl font-black text-blue-600 mb-1">{totalQuizAttempts}</p>
              <p className="text-gray-400 text-xs">ครั้ง</p>
            </div>

            {/* Passed */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">สอบผ่าน</p>
              <p className="text-4xl font-black text-emerald-600 mb-1">{passedQuizAttempts}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex-grow h-2 rounded-full bg-gray-100" style={{ maxWidth: "120px" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${passRate}%`, background: "linear-gradient(90deg, #10b981, #059669)" }}
                  />
                </div>
                <span className="text-xs text-emerald-600 font-semibold">{passRate}%</span>
              </div>
            </div>

            {/* Avg Score */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">คะแนนเฉลี่ย</p>
              <p className="text-4xl font-black text-violet-600 mb-1">{averageScore}<span className="text-xl font-bold text-gray-400">%</span></p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={Number(averageScore) >= s * 20 ? "#f59e0b" : "none"}
                    style={{ color: "#f59e0b" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== MY COURSES ===== */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: "#faf5ff" }}>
                <BookOpen size={22} style={{ color: "#8b5cf6" }} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">หลักสูตรของคุณ</h2>
            </div>
            <Link
              href="/courses"
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "#8b5cf6" }}
            >
              ดูทั้งหมด <ChevronRight size={16} />
            </Link>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((enroll) => {
                const latestPassedAttemptInCourse = latestPassedAttemptByCourse.get(enroll.courseId);
                const isCompleted = enroll.status === "COMPLETED";

                return (
                  <div
                    key={enroll.id}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    {/* Course Image */}
                    <div className="relative h-44 w-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #c7d2fe, #ddd6fe)" }}>
                      {enroll.course.imageUrl ? (
                        <Image
                          src={enroll.course.imageUrl}
                          alt={enroll.course.title}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={48} style={{ color: "#8b5cf6", opacity: 0.5 }} />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full"
                          style={
                            isCompleted
                              ? { background: "#d1fae5", color: "#065f46" }
                              : { background: "#fef3c7", color: "#92400e" }
                          }
                        >
                          {isCompleted ? "✓ เรียนจบแล้ว" : "กำลังเรียน"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow" style={{ background: "#fafafa" }}>
                      <h3 className="font-bold text-gray-800 mb-3 leading-snug line-clamp-2">
                        {enroll.course.title}
                      </h3>

                      <div className="flex items-center gap-4 mb-4">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <BookOpen size={12} /> {enroll.course._count.lessons} บทเรียน
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {enroll.enrolledAt.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="h-1.5 rounded-full" style={{ background: "#e5e7eb" }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: isCompleted ? "100%" : "50%",
                              background: isCompleted
                                ? "linear-gradient(90deg,#10b981,#059669)"
                                : "linear-gradient(90deg,#f59e0b,#d97706)",
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-2">
                        {isCompleted ? (
                          <>
                            {/* ปุ่มดูวิดีโอซ้ำ */}
                            <Link
                              href={`/courses/${enroll.courseId}/learn`}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                            >
                              <Play size={15} fill="white" /> ดูวิดีโอซ้ำ
                            </Link>
                            {/* ปุ่มดูผลคะแนน (ถ้ามี attempt) */}
                            {latestPassedAttemptInCourse && (
                              <Link
                                href={`/results/${latestPassedAttemptInCourse.id}`}
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold"
                                style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }}
                              >
                                <FileText size={14} /> ดูผลคะแนน
                              </Link>
                            )}
                          </>
                        ) : (
                          <Link
                            href={`/courses/${enroll.courseId}/learn`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                          >
                            <Play size={15} fill="white" /> เรียนต่อ
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: "#f3f4f6" }}>
                <BookOpen size={36} style={{ color: "#d1d5db" }} />
              </div>
              <p className="text-gray-500 font-medium">คุณยังไม่ได้ลงทะเบียนเรียนหลักสูตรใด</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
              >
                เลือกหลักสูตร <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* ===== CERTIFICATES ===== */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl" style={{ background: "#fefce8" }}>
              <Award size={22} style={{ color: "#d97706" }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">ใบประกาศนียบัตรของคุณ</h2>
          </div>

          {passedAttempts.length > 0 ? (
            <div className="space-y-3">
              {passedAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{ width: "44px", height: "44px", background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
                    >
                      <Award size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">
                        {attempt.quiz?.lesson?.course?.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        สอบผ่านเมื่อ{" "}
                        {attempt.createdAt.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/certificate/generate/${attempt.quizId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
                  >
                    <ExternalLink size={14} /> ดูใบประกาศฯ
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: "#fef3c7" }}>
                <Award size={36} style={{ color: "#fbbf24" }} />
              </div>
              <p className="text-gray-500 font-medium">คุณยังไม่มีใบประกาศนียบัตร</p>
              <p className="text-gray-400 text-sm mt-1">เรียนจบและสอบผ่านเพื่อรับใบประกาศนียบัตร</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
