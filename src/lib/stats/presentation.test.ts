import { describe, expect, it } from "vitest";
import { getBarDelay, getBarScale, getSharePercentage } from "./presentation";

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
});
