export type YouTubeVideoStats = {
  viewCount: string | null;
  likeCount: string | null;
};

type YouTubeVideosResponse = {
  items?: Array<{
    id?: string;
    statistics?: {
      viewCount?: string;
      likeCount?: string;
    };
  }>;
};

/** Fetches public YouTube counts in cached server requests; the API key stays server-side. */
export async function getYouTubeStats(videoIds: string[]): Promise<Record<string, YouTubeVideoStats>> {
  const uniqueIds = [...new Set(videoIds.filter((id) => /^[a-zA-Z0-9_-]{11}$/.test(id)))];
  const emptyStats = Object.fromEntries(
    uniqueIds.map((id) => [id, { viewCount: null, likeCount: null }]),
  ) as Record<string, YouTubeVideoStats>;
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (!apiKey || !uniqueIds.length) return emptyStats;

  const batches = Array.from({ length: Math.ceil(uniqueIds.length / 50) }, (_, index) =>
    uniqueIds.slice(index * 50, (index + 1) * 50),
  );

  await Promise.all(batches.map(async (batch) => {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "statistics");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);

    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return;

      const result = (await response.json()) as YouTubeVideosResponse;
      for (const item of result.items ?? []) {
        if (!item.id || !emptyStats[item.id]) continue;
        emptyStats[item.id] = {
          viewCount: item.statistics?.viewCount ?? null,
          likeCount: item.statistics?.likeCount ?? null,
        };
      }
    } catch {
      // The podcast page remains usable when YouTube counts are unavailable.
    }
  }));

  return emptyStats;
}
