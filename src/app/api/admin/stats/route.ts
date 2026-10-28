import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { AdminStatsResponse } from "@/lib/stats/admin-dashboard";
import { getYouTubeStats } from "@/lib/podcasts/youtube-stats";
import { getCertificateStats, groupCoursesByCategory } from "@/lib/stats/presentation";

const RECENT_LIMIT = 5;

export async function GET() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "ORG_ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const isOrgAdmin = session.user.role === "ORG_ADMIN";
  const isAdmin = session.user.role === "ADMIN";
  const organizationId = session.user.organizationId;

  if (isOrgAdmin && !organizationId) {
    return new NextResponse("Organization not found", { status: 400 });
  }

  try {
    const organizationScope = organizationId ?? 0;
    const userWhere = isOrgAdmin
      ? { organizationId: organizationScope, role: "USER" as const }
      : { role: "USER" as const };
    const courseWhere = isOrgAdmin ? { organizationId: organizationScope } : {};
    const lessonWhere = isOrgAdmin
      ? { course: { organizationId: organizationScope } }
      : {};
    const quizWhere = isOrgAdmin
      ? { lesson: { course: { organizationId: organizationScope } } }
      : {};
    const questionWhere = isOrgAdmin
      ? { quiz: { lesson: { course: { organizationId: organizationScope } } } }
      : {};
    const optionWhere = isOrgAdmin
      ? {
          question: {
            quiz: { lesson: { course: { organizationId: organizationScope } } },
          },
        }
      : {};
    const enrollmentWhere = isOrgAdmin
      ? { course: { organizationId: organizationScope } }
      : {};
    const lessonProgressWhere = isOrgAdmin
      ? { lesson: { course: { organizationId: organizationScope } } }
      : {};
    const quizAttemptWhere = isOrgAdmin
      ? { quiz: { lesson: { course: { organizationId: organizationScope } } } }
      : {};
    const categoryWhere = isOrgAdmin
      ? { courses: { some: { organizationId: organizationScope } } }
      : {};

    const [
      learnerCount,
      courseCount,
      categoryCount,
      lessonCount,
      quizCount,
      questionCount,
      optionCount,
      enrollmentGroups,
      lessonProgressGroups,
      quizAttemptGroups,
      organizationCount,
      podcastGroups,
    ] = await Promise.all([
      prisma.user.count({ where: userWhere }),
      prisma.course.count({ where: courseWhere }),
      prisma.category.count({ where: categoryWhere }),
      prisma.lesson.count({ where: lessonWhere }),
      prisma.quiz.count({ where: quizWhere }),
      prisma.question.count({ where: questionWhere }),
      prisma.option.count({ where: optionWhere }),
      prisma.userCourseEnrollment.groupBy({
        by: ["status"],
        where: enrollmentWhere,
        _count: { _all: true },
      }),
      prisma.userLessonProgress.groupBy({
        by: ["completed"],
        where: lessonProgressWhere,
        _count: { _all: true },
      }),
      prisma.quizAttempt.groupBy({
        by: ["passed"],
        where: quizAttemptWhere,
        _count: { _all: true },
      }),
      isAdmin ? prisma.organization.count() : Promise.resolve(undefined),
      isAdmin
        ? prisma.podcast.groupBy({
            by: ["isPublished"],
            _count: { _all: true },
          })
        : Promise.resolve(undefined),
    ]);

    const [
      enrollmentsForAnalytics,
      usersForFaculty,
      courseEnrollmentStats,
      podcastVideos,
    ] =
      await Promise.all([
        prisma.userCourseEnrollment.findMany({
          where: enrollmentWhere,
          select: {
            userId: true,
            status: true,
          },
        }),
        prisma.user.findMany({
          where: {
            ...(isOrgAdmin ? { organizationId: organizationScope } : {}),
            role: { notIn: ["ADMIN", "ORG_ADMIN"] },
          },
          select: { faculty: true },
        }),
        prisma.course.findMany({
          where: courseWhere,
          select: {
            id: true,
            title: true,
            category: { select: { name: true } },
            _count: { select: { enrollments: true } },
          },
          orderBy: [
            { enrollments: { _count: "desc" } },
            { id: "asc" },
          ],
        }),
        isAdmin
          ? prisma.podcast.findMany({
              select: { id: true, title: true, youtubeVideoId: true, isPublished: true },
              orderBy: [{ order: "asc" }, { id: "desc" }],
            })
          : Promise.resolve(undefined),
      ]);

    const facultyMap: Record<string, number> = {};
    for (const user of usersForFaculty) {
      const facultyName = user.faculty || "ไม่ระบุคณะ";
      facultyMap[facultyName] = (facultyMap[facultyName] || 0) + 1;
    }

    const categoryStats = groupCoursesByCategory(
      courseEnrollmentStats.map((course) => ({
        courseId: course.id,
        courseTitle: course.title,
        categoryName: course.category?.name || "ไม่มีหมวดหมู่",
        count: course._count.enrollments,
      })),
    );
    const facultyStats = Object.entries(facultyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const [recentCourses, recentEnrollments, podcastStatsByVideoId] =
      await Promise.all([
        prisma.course.findMany({
          where: courseWhere,
          select: { title: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: RECENT_LIMIT,
        }),
        prisma.userCourseEnrollment.findMany({
          where: enrollmentWhere,
          select: {
            status: true,
            enrolledAt: true,
            course: { select: { title: true } },
          },
          orderBy: [{ enrolledAt: "desc" }, { id: "desc" }],
          take: RECENT_LIMIT,
        }),
        isAdmin
          ? getYouTubeStats((podcastVideos ?? []).map((podcast) => podcast.youtubeVideoId))
          : Promise.resolve(undefined),
      ]);

    const enrollmentCounts = enrollmentGroups.reduce(
      (counts, group) => {
        counts.total += group._count._all;
        if (group.status === "IN_PROGRESS") counts.inProgress = group._count._all;
        if (group.status === "COMPLETED") counts.completed = group._count._all;
        return counts;
      },
      { total: 0, inProgress: 0, completed: 0 },
    );
    const lessonProgressCounts = lessonProgressGroups.reduce(
      (counts, group) => {
        counts.total += group._count._all;
        if (group.completed) counts.completed = group._count._all;
        return counts;
      },
      { total: 0, completed: 0 },
    );
    const quizAttemptCounts = quizAttemptGroups.reduce(
      (counts, group) => {
        counts.total += group._count._all;
        if (group.passed) counts.passed = group._count._all;
        return counts;
      },
      { total: 0, passed: 0 },
    );

    const counts: AdminStatsResponse["counts"] = {
      learners: learnerCount,
      courses: courseCount,
      categories: categoryCount,
      lessons: lessonCount,
      quizzes: quizCount,
      questions: questionCount,
      options: optionCount,
      enrollments: enrollmentCounts,
      lessonProgress: lessonProgressCounts,
      quizAttempts: quizAttemptCounts,
    };

    const recent: AdminStatsResponse["recent"] = {
      courses: recentCourses.map((course) => ({
        title: course.title,
        createdAt: course.createdAt.toISOString(),
      })),
      enrollments: recentEnrollments.map((enrollment) => ({
        courseTitle: enrollment.course.title,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
      })),
    };

    const analytics: AdminStatsResponse["analytics"] = {
      categoryStats,
      facultyStats,
      certificateStats: getCertificateStats(enrollmentsForAnalytics),
      courseEnrollmentStats: courseEnrollmentStats.map(({ id, title, _count }) => ({
        id,
        title,
        _count,
      })),
    };

    if (isAdmin && organizationCount !== undefined) {
      counts.organizations = organizationCount;
    }

    if (isAdmin && podcastGroups && podcastVideos && podcastStatsByVideoId) {
      counts.podcasts = {
        total: podcastGroups.reduce((sum, group) => sum + group._count._all, 0),
        published:
          podcastGroups.find((group) => group.isPublished)?._count._all ?? 0,
      };

      analytics.podcastViews = podcastVideos
        .map((podcast) => ({
          id: podcast.id,
          title: podcast.title,
          isPublished: podcast.isPublished,
          viewCount: podcastStatsByVideoId[podcast.youtubeVideoId]?.viewCount ?? null,
        }))
        .sort((left, right) => {
          const leftCount = left.viewCount !== null && /^\d+$/.test(left.viewCount)
            ? BigInt(left.viewCount)
            : null;
          const rightCount = right.viewCount !== null && /^\d+$/.test(right.viewCount)
            ? BigInt(right.viewCount)
            : null;
          if (leftCount === null) return rightCount === null ? left.id - right.id : 1;
          if (rightCount === null) return -1;
          return leftCount === rightCount ? left.id - right.id : leftCount > rightCount ? -1 : 1;
        });
    }

    const response: AdminStatsResponse = {
      generatedAt: new Date().toISOString(),
      scope: isOrgAdmin
        ? { type: "organization", organizationId: organizationScope }
        : { type: "system" },
      counts,
      analytics,
      recent,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET_STATS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
