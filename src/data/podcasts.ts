export type PodcastEpisode = {
  id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  category?: string | null;
  viewCount?: string | null;
  likeCount?: string | null;
};
