export function getBarScale(value: number, maximum: number): number {
  if (maximum <= 0 || value <= 0) return 0;
  return Math.min(100, Math.round((value / maximum) * 100));
}

export function getSharePercentage(value: number, total: number): string {
  if (total <= 0 || value <= 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function getBarDelay(index: number): string {
  return `${Math.max(0, index) * 90}ms`;
}

export function getBarColor(index: number, colors: readonly string[]): string {
  if (!colors.length) return "";
  return colors[Math.max(0, index) % colors.length] ?? colors[0];
}

export function sortStatsByCount<T extends { name: string; count: number }>(
  stats: readonly T[],
): T[] {
  return [...stats].sort((left, right) => right.count - left.count);
}
