import { describe, expect, it } from "vitest";
import {
  getBarDelay,
  getBarColor,
  getBarScale,
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
