"use client";
/* eslint-disable @next/next/no-img-element -- YouTube thumbnails are remote and already sized by YouTube. */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Eye, Podcast, Search, ThumbsUp } from "lucide-react";
import GlassyCarousel, { type GlassyCarouselItem, type GlassyCarouselLabels } from "@/components/ui/glassy-coverflow-carousel";
import type { PodcastEpisode } from "@/data/podcasts";

const PAGE_SIZE = 12;
const ALL = "__all__";
const UNCATEGORIZED = "__none__";

const carouselLabels: Partial<GlassyCarouselLabels> = {
  watch: "รับชม",
  watchAria: (title) => `รับชม ${title}`,
  previewAria: (title) => `ดูตัวอย่าง ${title}`,
  selectAria: (title) => `เลือก ${title}`,
  videoSource: "YouTube",
  close: "ปิด",
  openVideo: "เปิดดูบน YouTube",
  dragHint: "ลากเพื่อเลื่อนดู",
  or: "หรือ",
  browse: "เพื่อเปลี่ยนตอน",
  controls: "ตัวควบคุมรายการ Podcast",
  previous: "ตอนก่อนหน้า",
  next: "ตอนถัดไป",
  play: "เล่นอัตโนมัติ",
  pause: "หยุดเล่นอัตโนมัติ",
  position: (current, total) => `ตอนที่ ${current} จาก ${total}`,
};

const carouselTheme = {
  "--carousel-background": "#ffffff",
  "--color-foreground": "#003049",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#003049",
  "--color-muted-foreground": "#66788a",
  "--color-border": "#e6ebef",
  "--color-primary": "#003049",
  "--color-primary-foreground": "#ffffff",
  "--carousel-shadow-color": "#003049",
} as React.CSSProperties;

function formatCount(count?: string | null) {
  if (count == null || !/^\d+$/.test(count)) return "—";
  try {
    return BigInt(count).toLocaleString("th-TH");
  } catch {
    return "—";
  }
}

const watchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;
const thumbnail = (videoId: string, size: "hqdefault" | "mqdefault") => `https://i.ytimg.com/vi/${videoId}/${size}.jpg`;

function VideoStats({ episode }: { episode: PodcastEpisode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500" aria-label={`สถิติของ ${episode.title}`}>
      <span className="inline-flex items-center gap-1.5" aria-label={`ยอดดู ${formatCount(episode.viewCount)}`}>
        <Eye size={14} aria-hidden="true" /> {formatCount(episode.viewCount)}
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`ยอดถูกใจ ${formatCount(episode.likeCount)}`}>
        <ThumbsUp size={13} aria-hidden="true" /> {formatCount(episode.likeCount)}
      </span>
    </div>
  );
}

function toCarouselItem(episode: PodcastEpisode): GlassyCarouselItem {
  const views = formatCount(episode.viewCount);
  return {
    id: episode.id,
    title: episode.title,
    subtitle: [episode.category || "Podcast", views === "—" ? null : `${views} ครั้ง`].filter(Boolean).join(" · "),
    image: thumbnail(episode.youtubeVideoId, "hqdefault"),
    description: episode.description,
    href: watchUrl(episode.youtubeVideoId),
    trailerUrl: watchUrl(episode.youtubeVideoId),
  };
}

export default function PodcastLibrary({ episodes }: { episodes: PodcastEpisode[] }) {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(episodes[0]?.id);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const carouselRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const episode of episodes) {
      const key = episode.category || UNCATEGORIZED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const named = [...counts.keys()].filter((key) => key !== UNCATEGORIZED).sort((a, b) => a.localeCompare(b, "th"));
    // Uncategorized episodes only need their own filter once named categories exist.
    if (named.length && counts.has(UNCATEGORIZED)) named.push(UNCATEGORIZED);
    return named.map((key) => ({ key, label: key === UNCATEGORIZED ? "อื่น ๆ" : key, count: counts.get(key)! }));
  }, [episodes]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("th");
    return episodes.filter((episode) => {
      if (category !== ALL && (episode.category || UNCATEGORIZED) !== category) return false;
      return !needle || `${episode.title} ${episode.description}`.toLocaleLowerCase("th").includes(needle);
    });
  }, [episodes, category, query]);

  const items = useMemo(() => filtered.map(toCarouselItem), [filtered]);
  const selectedIndex = Math.max(0, filtered.findIndex((episode) => episode.id === selectedId));
  const selected = filtered[selectedIndex];
  const handleSelect = useCallback((item: GlassyCarouselItem) => setSelectedId(item.id), []);

  function changeCategory(next: string) {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
  }

  function chooseEpisode(id: string) {
    setSelectedId(id);
    carouselRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (!episodes.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-20 text-center">
        <Podcast size={36} strokeWidth={1.5} className="mx-auto mb-5 text-gray-400" aria-hidden="true" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">ยังไม่มีตอน Podcast ในขณะนี้</h2>
        <p className="text-gray-500">พบกับเรื่องราว ความรู้ และแรงบันดาลใจในตอนใหม่เร็ว ๆ นี้</p>
      </div>
    );
  }

  const chipClass = (active: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f77f00] ${
      active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
    }`;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {categories.length > 0 ? (
          <div role="group" aria-label="หมวดหมู่ Podcast" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button type="button" aria-pressed={category === ALL} onClick={() => changeCategory(ALL)} className={chipClass(category === ALL)}>
              ทั้งหมด <span className="text-xs opacity-70">{episodes.length}</span>
            </button>
            {categories.map(({ key, label, count }) => (
              <button key={key} type="button" aria-pressed={category === key} onClick={() => changeCategory(key)} className={chipClass(category === key)}>
                {label} <span className="text-xs opacity-70">{count}</span>
              </button>
            ))}
          </div>
        ) : <span />}
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">ค้นหาตอน Podcast</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="ค้นหาตอน"
            className="min-h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900"
          />
        </label>
      </div>

      {items.length ? (
        <div ref={carouselRef} className="overflow-hidden rounded-xl border border-gray-200">
          <GlassyCarousel
            key={category}
            items={items}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            label="วิดีโอ Podcast"
            labels={carouselLabels}
            className="podcast-coverflow"
            style={carouselTheme}
          />
        </div>
      ) : (
        <div role="status" className="rounded-xl border border-gray-200 px-6 py-16 text-center text-gray-500">
          ไม่พบตอนที่ตรงกับการค้นหา
        </div>
      )}

      {filtered.length > 0 && (
        <section aria-labelledby="podcast-episodes">
          <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-gray-200 pb-3">
            <h2 id="podcast-episodes" className="text-lg font-semibold text-gray-900">ตอนทั้งหมด</h2>
            <span className="text-sm text-gray-500">{filtered.length} ตอน</span>
          </div>
          <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, visibleCount).map((episode) => {
              const isSelected = episode.id === selected?.id;
              return (
                <li key={episode.id}>
                  <button
                    type="button"
                    onClick={() => chooseEpisode(episode.id)}
                    aria-pressed={isSelected}
                    className="group block w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f77f00]"
                  >
                    <span className={`relative block aspect-video overflow-hidden rounded-lg border bg-gray-100 transition-colors ${isSelected ? "border-gray-900" : "border-gray-200 group-hover:border-gray-400"}`}>
                      <img src={thumbnail(episode.youtubeVideoId, "mqdefault")} alt="" loading="lazy" className="h-full w-full object-cover" />
                      {isSelected && <span className="absolute left-2 top-2 rounded bg-gray-900 px-2 py-0.5 text-[11px] font-medium text-white">กำลังเลือก</span>}
                    </span>
                    {episode.category && <span className="mt-3 block text-xs font-medium text-accent-text">{episode.category}</span>}
                    <span className={`block font-medium leading-snug break-words text-gray-900 line-clamp-2 ${episode.category ? "mt-1" : "mt-3"}`}>{episode.title}</span>
                    <span className="mt-2 block"><VideoStats episode={episode} /></span>
                  </button>
                </li>
              );
            })}
          </ol>
          {visibleCount < filtered.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex min-h-11 items-center rounded-lg border border-gray-900 px-6 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
              >
                แสดงเพิ่มอีก {Math.min(PAGE_SIZE, filtered.length - visibleCount)} ตอน
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
