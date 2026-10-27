import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ default: { podcast: { findMany } } }));
import PodcastsPage from "../../app/(main)/podcasts/page";

it("requests only published episodes in display order and adapts database IDs for the player", async () => {
  findMany.mockResolvedValue([{ id: 7, title: "ตอนเผยแพร่", description: "รายละเอียด", youtubeVideoId: "abcdefghijk" }]);
  const html = renderToStaticMarkup(await PodcastsPage());
  expect(findMany).toHaveBeenCalledWith({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { id: "desc" }],
    select: { id: true, title: true, description: true, youtubeVideoId: true },
  });
  expect(html).toContain('src="https://www.youtube-nocookie.com/embed/abcdefghijk"');
  expect(html).toContain("ตอนเผยแพร่");
});
