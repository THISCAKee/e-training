import { describe, expect, it } from "vitest";
import { getAdminNavItems } from "./presentation";

describe("admin navigation presentation", () => {
  it("shows the full operations navigation to administrators", () => {
    expect(getAdminNavItems("ADMIN").map((item) => item.id)).toEqual([
      "dashboard",
      "courses",
      "users",
      "organizations",
    ]);
  });

  it("limits organization administrators to scoped overview and courses", () => {
    expect(getAdminNavItems("ORG_ADMIN").map((item) => item.id)).toEqual([
      "dashboard",
      "courses",
    ]);
  });
});
