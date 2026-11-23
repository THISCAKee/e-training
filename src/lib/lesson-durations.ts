export function loadLessonDuration(video: HTMLVideoElement, url: string, report: (duration: number) => void) {
  video.preload = "metadata";
  video.onloadedmetadata = () => {
    if (Number.isFinite(video.duration) && video.duration > 0) report(video.duration);
  };
  video.src = url;
  return () => {
    video.onloadedmetadata = null;
    video.removeAttribute("src");
    video.load();
  };
}
