export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") {
      id = url.pathname.match(/^\/([^/]+)\/?$/)?.[1] ?? null;
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(host)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1] ?? null;
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function parsePodcastInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("ข้อมูล Podcast ไม่ถูกต้อง");
  const data = value as Record<string, unknown>;
  if (typeof data.title !== "string" || !data.title.trim() || data.title.trim().length > 255) throw new Error("กรุณากรอกชื่อตอน ไม่เกิน 255 ตัวอักษร");
  if (typeof data.description !== "string" || data.description.length > 10000) throw new Error("รายละเอียดต้องไม่เกิน 10,000 ตัวอักษร");
  const videoId = typeof data.youtubeUrl === "string" ? youtubeVideoId(data.youtubeUrl) : null;
  if (!videoId) throw new Error("กรุณากรอกลิงก์วิดีโอ YouTube ที่ถูกต้อง");
  if (typeof data.order !== "number" || !Number.isInteger(data.order) || data.order < 0 || data.order > 2147483647) throw new Error("ลำดับต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 2147483647");
  if (typeof data.isPublished !== "boolean") throw new Error("สถานะเผยแพร่ไม่ถูกต้อง");
  return { title: data.title.trim(), description: data.description.trim(), youtubeVideoId: videoId, order: data.order, isPublished: data.isPublished };
}
