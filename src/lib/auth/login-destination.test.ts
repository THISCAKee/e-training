import { describe, expect, it } from "vitest";
import { getLoginDestination } from "./login-destination";

describe("getLoginDestination", () => {
  it("sends ADMIN to /admin", () => {
    expect(getLoginDestination("ADMIN", "/courses")).toBe("/admin");
  });

  it("keeps the current ORG_ADMIN destination", () => {
    expect(getLoginDestination("ORG_ADMIN", "/courses")).toBe("/");
  });

  it("lets USER follow a safe application path", () => {
    expect(getLoginDestination("USER", "/courses/1")).toBe("/courses/1");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/login",
    "/login?next=/admin",
    "courses",
  ])("rejects unsafe callback %s", (callbackUrl) => {
    expect(getLoginDestination("USER", callbackUrl)).toBe("/");
  });
});
