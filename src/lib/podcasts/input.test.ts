import { describe, expect, it } from "vitest";
import { parsePodcastInput, youtubeVideoId } from "./input";

const id = "abcdefghijk";
const valid = { title: " ตอนแรก ", description: " รายละเอียด ", youtubeUrl: `https://youtu.be/${id}`, order: 0, isPublished: false };

describe("podcast inputs", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${id}&t=10`, id],
    [`https://youtu.be/${id}?si=example`, id],
    [`https://youtube.com/shorts/${id}`, id],
    [`https://www.youtube.com/live/${id}`, id],
    [`https://www.youtube.com/embed/${id}`, id],
    ["https://youtube.com.evil.com/watch?v=abcdefghijk", null],
    ["javascript:alert(1)", null], ["https://youtu.be/short", null],
    ["https://example.com/abcdefghijk", null], ["", null],
  ])("normalizes only valid YouTube URLs: %s", (url, expected) => {
    expect(youtubeVideoId(url)).toBe(expected);
  });
  it("trims fields and retains an unpublished episode", () => {
    expect(parsePodcastInput(valid)).toEqual({ title: "ตอนแรก", description: "รายละเอียด", youtubeVideoId: id, order: 0, isPublished: false });
  });
  it.each([
    null, [], { ...valid, title: "  " }, { ...valid, title: "a".repeat(256) },
    { ...valid, order: -1 }, { ...valid, order: 1.5 },
    { ...valid, isPublished: "false" }, { ...valid, youtubeUrl: "https://evil.com" },
  ])("rejects invalid fields", (input) => {
    expect(() => parsePodcastInput(input)).toThrow();
  });
});
