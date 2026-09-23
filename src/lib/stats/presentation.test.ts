import { describe, expect, it } from "vitest";
import {
  getBarDelay,
  getBarColor,
  getBarScale,
  getCertificateStats,
  groupCoursesByCategory,
  getSharePercentage,
  sortStatsByCount,
} from "./presentation";

describe("public stats presentation helpers", () => {
  it("scales the largest value to a full bar and protects empty data", () => {
    expect(getBarScale(80, 80)).toBe(100);
    expect(getBarScale(20, 80)).toBe(25);
    expect(getBarScale(20, 0)).toBe(0);
  });

  it("returns a readable share percentage from a total", () => {
    expect(getSharePercentage(1, 3)).toBe("33.3%");
    expect(getSharePercentage(0, 0)).toBe("0%");
  });

  it("staggers bars in a short readable sequence", () => {
    expect(getBarDelay(0)).toBe("0ms");
    expect(getBarDelay(3)).toBe("270ms");
    expect(getBarDelay(-1)).toBe("0ms");
  });

  it("cycles through the supplied colors for every vertical bar", () => {
    const colors = ["#0f766e", "#4f46e5", "#f5b942"];

    expect(getBarColor(0, colors)).toBe("#0f766e");
    expect(getBarColor(2, colors)).toBe("#f5b942");
    expect(getBarColor(3, colors)).toBe("#0f766e");
  });

  it("counts each learner once across certificate statuses", () => {
    const enrollments = [
      { userId: 1, status: "COMPLETED" },
      { userId: 1, status: "IN_PROGRESS" },
      { userId: 2, status: "IN_PROGRESS" },
      { userId: 3, status: "COMPLETED" },
    ];

    expect(getCertificateStats(enrollments)).toEqual([
      { name: "ได้รับใบประกาศ", count: 2 },
      { name: "ยังไม่ได้รับใบประกาศ", count: 1 },
    ]);
  });

  it("groups courses under each category and counts their learners", () => {
    const enrollments = [
      { courseId: 1, courseTitle: "สร้างภาพด้วย AI", categoryName: "AI For Creative" },
      { courseId: 1, courseTitle: "สร้างภาพด้วย AI", categoryName: "AI For Creative" },
      { courseId: 2, courseTitle: "เขียน Prompt", categoryName: "AI For Creative" },
      { courseId: 3, courseTitle: "AI กับงานวิจัย", categoryName: "AI For Research" },
      { courseId: 4, courseTitle: "พื้นฐาน AI", categoryName: "AI For Life", count: 0 },
    ];

    expect(groupCoursesByCategory(enrollments)).toEqual([
      {
        name: "AI For Creative",
        count: 3,
        courses: [
          { id: 1, title: "สร้างภาพด้วย AI", count: 2 },
          { id: 2, title: "เขียน Prompt", count: 1 },
        ],
      },
      {
        name: "AI For Research",
        count: 1,
        courses: [{ id: 3, title: "AI กับงานวิจัย", count: 1 }],
      },
      {
        name: "AI For Life",
        count: 0,
        courses: [{ id: 4, title: "พื้นฐาน AI", count: 0 }],
      },
    ]);
  });

  it("sorts every faculty or organization by learner count without mutating input", () => {
    const stats = [
      { name: "คณะวิทยาศาสตร์", count: 12 },
      { name: "คณะมนุษยศาสตร์", count: 31 },
      { name: "สำนักวิทยบริการ", count: 12 },
    ];

    expect(sortStatsByCount(stats)).toEqual([
      { name: "คณะมนุษยศาสตร์", count: 31 },
      { name: "คณะวิทยาศาสตร์", count: 12 },
      { name: "สำนักวิทยบริการ", count: 12 },
    ]);
    expect(stats).toEqual([
      { name: "คณะวิทยาศาสตร์", count: 12 },
      { name: "คณะมนุษยศาสตร์", count: 31 },
      { name: "สำนักวิทยบริการ", count: 12 },
    ]);
  });
});
