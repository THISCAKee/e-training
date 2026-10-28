export type AdminStatsScope =
  | { type: "system" }
  | { type: "organization"; organizationId: number };

export type AdminStatsGroup = {
  name: string;
  count: number;
};

export type AdminStatsCategory = AdminStatsGroup & {
  courses: Array<{
    id: number;
    title: string;
    count: number;
  }>;
};

export type CourseEnrollmentStat = {
  id: number;
  title: string;
  _count: {
    enrollments: number;
  };
};

export type AdminStatsResponse = {
  generatedAt: string;
  scope: AdminStatsScope;
  counts: {
    learners: number;
    organizations?: number;
    courses: number;
    categories: number;
    lessons: number;
    quizzes: number;
    questions: number;
    options: number;
    enrollments: {
      total: number;
      inProgress: number;
      completed: number;
    };
    lessonProgress: {
      total: number;
      completed: number;
    };
    quizAttempts: {
      total: number;
      passed: number;
    };
    podcasts?: {
      total: number;
      published: number;
    };
  };
  analytics: {
    categoryStats: AdminStatsCategory[];
    facultyStats: AdminStatsGroup[];
    certificateStats: AdminStatsGroup[];
    courseEnrollmentStats: CourseEnrollmentStat[];
    podcastViews?: Array<{
      id: number;
      title: string;
      isPublished: boolean;
      viewCount: string | null;
    }>;
  };
  recent: {
    courses: Array<{
      title: string;
      createdAt: string;
    }>;
    enrollments: Array<{
      courseTitle: string;
      status: "IN_PROGRESS" | "COMPLETED";
      enrolledAt: string;
    }>;
  };
};
