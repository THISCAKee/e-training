import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Podcast } from "lucide-react";
import PodcastLibrary from "@/components/PodcastLibrary";
import prisma from "@/lib/prisma";
import { getYouTubeStats } from "@/lib/podcasts/youtube-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Podcast | MSU AI-Training",
  description: "รับชมวิดีโอ Podcast เรียนรู้เรื่อง AI พร้อมเรื่องราวและแรงบันดาลใจจาก MSU AI-Training",
};

export default async function PodcastsPage() {
  const records = await prisma.podcast.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { id: "desc" }],
    select: { id: true, title: true, description: true, youtubeVideoId: true },
  });
  const statsByVideoId = await getYouTubeStats(records.map((episode) => episode.youtubeVideoId));
  const podcastEpisodes = records.map((episode) => ({
    ...episode,
    id: String(episode.id),
    ...statsByVideoId[episode.youtubeVideoId],
  }));
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 rounded text-sm text-gray-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <ArrowLeft size={16} aria-hidden="true" /> กลับหน้าหลัก
        </Link>
        <header className="mb-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Podcast size={18} aria-hidden="true" /> MSU AI-Training
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Podcast</h1>
          <p className="text-lg leading-relaxed text-gray-600">รับชมและรับฟังความรู้เกี่ยวกับ AI พร้อมเรื่องราวและแรงบันดาลใจ ผ่านวิดีโอ Podcast ที่คุณเลือกดูได้ทุกเวลา</p>
        </header>
        <PodcastLibrary episodes={podcastEpisodes} />
      </div>
    </div>
  );
}
