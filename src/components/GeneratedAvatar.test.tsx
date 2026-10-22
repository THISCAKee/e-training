import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GeneratedAvatar from "./GeneratedAvatar";

describe("generated account avatars", () => {
  it("keeps an account's avatar identical across renders", () => {
    const first = renderToStaticMarkup(<GeneratedAvatar seed="member-001" />);
    const second = renderToStaticMarkup(<GeneratedAvatar seed="member-001" />);
    expect(first).toBe(second);
    expect(first).toContain("<path");
    expect(first).not.toContain("member-001");
  });

  it("generates different portraits for different accounts", () => {
    const first = renderToStaticMarkup(<GeneratedAvatar seed="member-001" />);
    const second = renderToStaticMarkup(<GeneratedAvatar seed="member-002" />);
    expect(first).not.toBe(second);
  });
});
