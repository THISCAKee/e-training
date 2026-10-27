import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PodcastLibrary from "./PodcastLibrary";

const episodes = [
  { id: "one", title: "ตอนแรก", description: "เรื่องราวของ AI", youtubeVideoId: "abcdefghijk" },
  { id: "two", title: "ตอนที่สอง", description: "เรียนรู้เพิ่มเติม", youtubeVideoId: "lmnopqrstuv" },
];

describe("Podcast library", () => {
  it("shows an honest empty state without loading a video when no episodes exist", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={[]} />);
    expect(html).toContain("ยังไม่มีตอน Podcast ในขณะนี้");
    expect(html).not.toContain("<iframe");
  });

  it("embeds the first episode with an accessible title and YouTube fallback", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={episodes} />);
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/abcdefghijk"');
    expect(html).toContain('title="ตอนแรก"');
    expect(html).toContain("https://www.youtube.com/watch?v=abcdefghijk");
    expect(html).not.toContain("autoplay=1");
  });

  it("offers every episode with a marked current selection", () => {
    const html = renderToStaticMarkup(<PodcastLibrary episodes={episodes} />);
    expect(html).toContain("ตอนที่สอง");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });
});
