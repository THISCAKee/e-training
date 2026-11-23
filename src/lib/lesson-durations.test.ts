import { describe, expect, it, vi } from "vitest";
import { loadLessonDuration } from "./lesson-durations";

describe("lesson video duration", () => {
  it("reports the actual duration when metadata loads and cleans up", () => {
    const video = { preload: "", src: "", duration: 123.8, onloadedmetadata: null, onerror: null, removeAttribute: vi.fn(), load: vi.fn() } as unknown as HTMLVideoElement;
    const report = vi.fn();
    const cleanup = loadLessonDuration(video, "https://example.com/video.mp4", report);
    video.onloadedmetadata?.(new Event("loadedmetadata"));
    expect(report).toHaveBeenCalledWith(123.8);
    cleanup();
    expect(video.onloadedmetadata).toBeNull();
    expect(video.removeAttribute).toHaveBeenCalledWith("src");
  });

  it("keeps the saved duration when metadata is unavailable or invalid", () => {
    const video = { preload: "", src: "", duration: Infinity, onloadedmetadata: null, onerror: null, removeAttribute: vi.fn(), load: vi.fn() } as unknown as HTMLVideoElement;
    const report = vi.fn();
    loadLessonDuration(video, "https://example.com/video.mp4", report);
    video.onloadedmetadata?.(new Event("loadedmetadata"));
    video.onerror?.(new Event("error"));
    expect(report).not.toHaveBeenCalled();
  });
});
