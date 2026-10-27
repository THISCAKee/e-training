"use client";

import React, { useState } from "react";
import { ArrowUpRight, Eye, Play, Podcast, ThumbsUp } from "lucide-react";
import type { PodcastEpisode } from "@/data/podcasts";

function VideoStats({ episode }: { episode: PodcastEpisode }) {
  const formatCount = (count?: string | null) => {
    if (count == null || !/^\d+$/.test(count)) return "—";
    try {
      return BigInt(count).toLocaleString("th-TH");
    } catch {
      return "—";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500" aria-label={`สถิติของ ${episode.title}`}>
      <span className="inline-flex items-center gap-1.5" aria-label={`ยอดดู ${formatCount(episode.viewCount)}`}>
        <Eye size={16} aria-hidden="true" /> {formatCount(episode.viewCount)} <span>ยอดดู</span>
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`ยอดถูกใจ ${formatCount(episode.likeCount)}`}>
        <ThumbsUp size={15} aria-hidden="true" /> {formatCount(episode.likeCount)} <span>ถูกใจ</span>
      </span>
    </div>
  );
}

export default function PodcastLibrary({ episodes }: { episodes: PodcastEpisode[] }) {
  const [selectedId, setSelectedId] = useState(episodes[0]?.id);
  const selected = episodes.find((episode) => episode.id === selectedId) ?? episodes[0];

  if (!selected) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
        <Podcast size={48} strokeWidth={1.5} className="mx-auto mb-6 text-blue-600" aria-hidden="true" />
        <h2 className="mb-3 text-2xl font-semibold text-gray-900">ยังไม่มีตอน Podcast ในขณะนี้</h2>
        <p className="text-gray-600">พบกับเรื่องราว ความรู้ และแรงบันดาลใจในตอนใหม่เร็ว ๆ นี้</p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <section aria-label="วิดีโอ Podcast" className="min-w-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="aspect-video bg-gray-950">
          <iframe
            key={selected.youtubeVideoId}
            src={`https://www.youtube-nocookie.com/embed/${selected.youtubeVideoId}`}
            title={selected.title}
            className="h-full w-full border-0"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="p-6 sm:p-8" aria-live="polite">
          <p className="mb-3 text-sm font-semibold text-blue-600">กำลังรับชม</p>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">{selected.title}</h2>
          <p className="whitespace-pre-line leading-relaxed text-gray-600">{selected.description}</p>
          <div className="mt-5 border-y border-gray-100 py-4">
            <VideoStats episode={selected} />
          </div>
          <a href={`https://www.youtube.com/watch?v=${selected.youtubeVideoId}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            เปิดดูบน YouTube <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section aria-labelledby="podcast-episodes" className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="podcast-episodes" className="text-xl font-bold text-gray-900">ตอนทั้งหมด</h2>
          <span className="text-sm text-gray-500">{episodes.length} ตอน</span>
        </div>
        <ol className="space-y-3">
          {episodes.map((episode, index) => (
            <li key={episode.id}>
              <button type="button" onClick={() => setSelectedId(episode.id)} aria-pressed={episode.id === selected.id}
                className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${episode.id === selected.id ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Play size={18} aria-hidden="true" /></span>
                <span className="min-w-0">
                  <span className="mb-1 block text-xs font-semibold text-blue-700">ตอนที่ {index + 1}</span>
                  <span className="block font-semibold break-words text-gray-900">{episode.title}</span>
                  <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-gray-600">{episode.description}</span>
                  <span className="mt-3 block"><VideoStats episode={episode} /></span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
