import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PodcastLibrary from "./PodcastLibrary";

const episodes = [
  { id: "one", title: "ตอนแรก", description: "เรื่องราวของ AI", youtubeVideoId: "abcdefghijk", category: "AI กับการเรียนรู้" },
  { id: "two", title: "ตอนที่สอง", description: "เรียนรู้เพิ่มเติม", youtubeVideoId: "lmnopqrstuv", category: "ห้องสมุด" },
  { id: "three", title: "ตอนที่สาม", description: "ไม่มีหมวด", youtubeVideoId: "wxyzABCDEFG" },
];

describe("Podcast library", () => {
  it("shows an honest empty state without loading a video when no episodes exist", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={[]} />);
    expect(html).toContain("ยังไม่มีตอน Podcast ในขณะนี้");
    expect(html).not.toContain("<iframe");
  });

  it("presents episodes in a coverflow without autoplaying a video", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={episodes} />);
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain("https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg");
    expect(html).toContain('aria-label="รับชม ตอนแรก"');
    expect(html).not.toContain("<iframe");
  });

  it("offers a filter for each category plus uncategorized episodes", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={episodes} />);
    expect(html).toContain('aria-label="หมวดหมู่ Podcast"');
    expect(html).toMatch(/ทั้งหมด <span[^>]*>3</);
    expect(html).toContain("AI กับการเรียนรู้");
    expect(html).toContain("ห้องสมุด");
    expect(html).toContain("อื่น ๆ");
  });

  it("hides category filters when no episode has a category", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={episodes.map((episode) => ({ ...episode, category: null }))} />);
    expect(html).not.toContain('aria-label="หมวดหมู่ Podcast"');
  });

  it("lists every episode with a marked current selection", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={episodes} />);
    expect(html).toContain("ตอนที่สอง");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("pages long episode lists instead of rendering them all at once", () => {
    const many = Array.from({ length: 30 }, (_, index) => ({
      id: String(index), title: `ตอน ${index}`, description: "", youtubeVideoId: `video${String(index).padStart(6, "0")}`,
    }));
    const html = renderToStaticMarkup(<PodcastLibrary episodes={many} />);
    expect(html).toContain("30 ตอน");
    expect(html).toContain("แสดงเพิ่มอีก 12 ตอน");
    expect(html.match(/mqdefault\.jpg/g)).toHaveLength(12);
  });
});
