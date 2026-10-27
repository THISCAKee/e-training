import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, store } = vi.hoisted(() => ({
  auth: vi.fn(),
  store: { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ default: { podcast: store } }));
import { GET, POST } from "../../app/api/admin/podcasts/route";
import { PATCH, DELETE } from "../../app/api/admin/podcasts/[id]/route";

const input = { title: "Podcast", description: "", youtubeUrl: "https://youtu.be/abcdefghijk", order: 2, isPublished: false };
const request = () => new Request("http://localhost/api/admin/podcasts", { method: "POST", body: JSON.stringify(input) });
const context = (id = "1") => ({ params: Promise.resolve({ id }) });

beforeEach(() => { vi.resetAllMocks(); auth.mockResolvedValue({ user: { role: "ADMIN" } }); });

describe("Podcast administration API", () => {
  it.each([null, { user: { role: "USER" } }, { user: { role: "ORG_ADMIN" } }])("denies every operation without ADMIN and never touches storage", async (session) => {
    auth.mockResolvedValue(session);
    for (const response of [await GET(), await POST(request()), await PATCH(request(), context()), await DELETE(request(), context())]) {
      expect(response.status).toBe(403);
    }
    for (const method of Object.values(store)) expect(method).not.toHaveBeenCalled();
  });
  it("stores the normalized video ID and retains the draft flag", async () => {
    store.create.mockResolvedValue({ id: 1 });
    expect((await POST(request())).status).toBe(201);
    expect(store.create).toHaveBeenCalledWith({ data: { title: "Podcast", description: "", youtubeVideoId: "abcdefghijk", order: 2, isPublished: false } });
  });
  it("rejects an invalid video before writing", async () => {
    const response = await POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({ ...input, youtubeUrl: "https://example.com" }) }));
    expect(response.status).toBe(400);
    expect(store.create).not.toHaveBeenCalled();
  });
  it("returns 404 for an episode removed before editing or deletion", async () => {
    store.updateMany.mockResolvedValue({ count: 0 });
    store.deleteMany.mockResolvedValue({ count: 0 });
    expect((await PATCH(request(), context())).status).toBe(404);
    expect((await DELETE(request(), context())).status).toBe(404);
  });
  it("rejects malformed IDs", async () => {
    expect((await PATCH(request(), context("1abc"))).status).toBe(400);
    expect((await DELETE(request(), context("-1"))).status).toBe(400);
    expect(store.deleteMany).not.toHaveBeenCalled();
    expect(store.updateMany).not.toHaveBeenCalled();
  });
  it("updates publication state with validated data", async () => {
    store.updateMany.mockResolvedValue({ count: 1 });
    expect((await PATCH(request(), context())).status).toBe(200);
    expect(store.updateMany).toHaveBeenCalledWith({ where: { id: 1 }, data: { title: "Podcast", description: "", youtubeVideoId: "abcdefghijk", order: 2, isPublished: false } });
  });
  it("deletes a matching episode", async () => {
    store.deleteMany.mockResolvedValue({ count: 1 });
    expect((await DELETE(request(), context())).status).toBe(204);
    expect(store.deleteMany).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
