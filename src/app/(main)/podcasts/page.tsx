import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PodcastLibrary from "@/components/PodcastLibrary";
import prisma from "@/lib/prisma";
import { getYouTubeStats } from "@/lib/podcasts/youtube-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Podcast | LIBRARY MSU PODCAST",
  description: "รับชมวิดีโอ Podcast เรื่องราวและแรงบันดาลใจจาก LIBRARY MSU PODCAST",
};

export default async function PodcastsPage() {
  const records = await prisma.podcast.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { id: "desc" }],
    select: { id: true, title: true, description: true, youtubeVideoId: true, category: true },
  });
  const statsByVideoId = await getYouTubeStats(records.map((episode) => episode.youtubeVideoId));
  const podcastEpisodes = records.map((episode) => ({
    ...episode,
    id: String(episode.id),
    ...statsByVideoId[episode.youtubeVideoId],
  }));
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 rounded text-sm text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f77f00]">
          <ArrowLeft size={16} aria-hidden="true" /> กลับหน้าหลัก
        </Link>
        <header className="mb-10 max-w-2xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-accent-text">LIBRARY MSU PODCAST</p>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Podcast</h1>
          <p className="text-base leading-relaxed text-gray-500">รับชมและรับฟังความรู้ เรื่องราวและแรงบันดาลใจ ผ่านวิดีโอ Podcast ที่คุณเลือกดูได้ทุกเวลา</p>
        </header>
        <PodcastLibrary episodes={podcastEpisodes} />
      </div>
    </div>
  );
}
