// src/lib/utils.ts

export const formatDuration = (
  totalSeconds: number | null | undefined
): string => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    isNaN(totalSeconds)
  ) {
    return "00:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};
