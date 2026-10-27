export type PodcastEpisode = {
  id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  viewCount?: string | null;
  likeCount?: string | null;
};
