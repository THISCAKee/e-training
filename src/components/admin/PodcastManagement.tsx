"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, ExternalLink, Podcast } from "lucide-react";
import { youtubeVideoId } from "@/lib/podcasts/input";

type Episode = {
  id: number;
  title: string;
  description: string;
  youtubeVideoId: string;
  order: number;
  isPublished: boolean;
};
type Draft = { title: string; description: string; youtubeUrl: string; order: number; isPublished: boolean };
const emptyDraft: Draft = { title: "", description: "", youtubeUrl: "", order: 0, isPublished: false };
const inputClass = "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base leading-5 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 sm:text-sm";

async function responseError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.error || "ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง";
}

async function fetchEpisodes(signal?: AbortSignal): Promise<Episode[]> {
  const response = await fetch("/api/admin/podcasts", { cache: "no-store", signal });
  if (!response.ok) throw new Error(await responseError(response));
  return (await response.json()).data;
}

export default function PodcastManagement() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const previewId = youtubeVideoId(draft.youtubeUrl);

  async function loadEpisodes() {
    try {
      setEpisodes(await fetchEpisodes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถโหลด Podcast ได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchEpisodes(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setEpisodes(data); })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "ไม่สามารถโหลด Podcast ได้");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  function editEpisode(episode?: Episode) {
    setEditingId(episode?.id ?? null);
    setDraft(episode ? {
      title: episode.title, description: episode.description,
      youtubeUrl: `https://www.youtube.com/watch?v=${episode.youtubeVideoId}`,
      order: episode.order, isPublished: episode.isPublished,
    } : { ...emptyDraft });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(editingId ? `/api/admin/podcasts/${editingId}` : "/api/admin/podcasts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setShowForm(false);
      setEditingId(null);
      setDraft({ ...emptyDraft });
      setNotice("บันทึก Podcast เรียบร้อยแล้ว");
      setLoading(true);
      await loadEpisodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถบันทึกได้");
    } finally {
      setBusy(false);
    }
  }

  async function removeEpisode(episode: Episode) {
    if (!window.confirm(`ต้องการลบ Podcast “${episode.title}” หรือไม่? การลบไม่สามารถย้อนกลับได้`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/podcasts/${episode.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      if (editingId === episode.id) setShowForm(false);
      setNotice("ลบ Podcast เรียบร้อยแล้ว");
      setLoading(true);
      await loadEpisodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถลบได้");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">เพิ่มวิดีโอจาก YouTube และเลือกตอนที่ต้องการเผยแพร่</p>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <a href="/podcasts" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">ดูหน้า Podcast <ExternalLink size={15} /></a>
          <button type="button" disabled={busy} onClick={() => editEpisode()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"><Plus size={17} /> เพิ่ม Podcast</button>
        </div>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error} <button type="button" disabled={busy || loading} onClick={() => { setError(""); setLoading(true); void loadEpisodes(); }} className="mt-1 inline-block min-h-11 py-2 font-semibold underline disabled:opacity-50 sm:ml-2 sm:mt-0">โหลดรายการใหม่</button></div>}
      {notice && <p role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">{notice}</p>}
      {showForm && (
        <form onSubmit={submit} className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-xl font-bold text-slate-900 sm:mb-6">{editingId ? "แก้ไข Podcast" : "เพิ่ม Podcast ใหม่"}</h2>
          <fieldset disabled={busy} className="min-w-0 space-y-4 disabled:opacity-60 sm:space-y-5">
            <div>
              <label htmlFor="podcast-title" className="block text-sm font-semibold text-slate-700">ชื่อตอน <span className="text-red-600">*</span></label>
              <input id="podcast-title" required maxLength={255} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="podcast-description" className="block text-sm font-semibold text-slate-700">รายละเอียด</label>
              <textarea id="podcast-description" rows={4} maxLength={10000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${inputClass} min-h-32 resize-y`} />
            </div>
            <div>
              <label htmlFor="podcast-url" className="block text-sm font-semibold text-slate-700">ลิงก์วิดีโอ YouTube <span className="text-red-600">*</span></label>
              <input id="podcast-url" required type="url" aria-describedby="podcast-url-hint" placeholder="https://www.youtube.com/watch?v=..." value={draft.youtubeUrl} onChange={(e) => setDraft({ ...draft, youtubeUrl: e.target.value })} className={inputClass} />
              <p id="podcast-url-hint" className="mt-2 text-xs text-slate-500">รองรับลิงก์ YouTube แบบปกติ, youtu.be, Shorts และ Live</p>
            </div>
            {previewId && <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950 sm:max-w-xl"><iframe key={previewId} src={`https://www.youtube-nocookie.com/embed/${previewId}`} title="ตัวอย่างวิดีโอ Podcast" className="h-full w-full border-0" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>}
            <div className="grid items-start gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="podcast-order" className="block text-sm font-semibold text-slate-700">ลำดับแสดงผล</label>
                <input id="podcast-order" required type="number" min={0} max={2147483647} step={1} value={Number.isNaN(draft.order) ? "" : draft.order} onChange={(e) => setDraft({ ...draft, order: e.target.valueAsNumber })} className={inputClass} />
                <p className="mt-2 text-xs text-slate-500">เลขน้อยแสดงก่อน หากเท่ากัน ตอนที่เพิ่มล่าสุดจะแสดงก่อน</p>
              </div>
              <div>
                <label htmlFor="podcast-published" className="block text-sm font-semibold text-slate-700">สถานะการเผยแพร่</label>
                <label htmlFor="podcast-published" className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 py-2 text-sm font-semibold text-slate-700">
                  <input id="podcast-published" type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} className="h-5 w-5 shrink-0 accent-teal-700" />
                  <span>เผยแพร่บนหน้า Podcast</span>
                </label>
                <p className="mt-2 text-xs text-slate-500">หากยังไม่เผยแพร่ รายการจะถูกบันทึกเป็นฉบับร่าง</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:gap-3 sm:pt-5">
              <button type="submit" className="min-h-11 w-full rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 sm:w-auto">{busy ? "กำลังบันทึก..." : "บันทึก Podcast"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="min-h-11 w-full rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto">ยกเลิก</button>
            </div>
          </fieldset>
        </form>
      )}
      {loading ? <p role="status" className="py-12 text-center text-slate-500">กำลังโหลดรายการ Podcast...</p> : !error && !episodes.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Podcast size={36} className="mx-auto mb-4 text-teal-700" />
          <h2 className="font-semibold text-slate-900">ยังไม่มี Podcast</h2>
          <p className="mt-2 text-sm text-slate-500">กด “เพิ่ม Podcast” เพื่อเริ่มเพิ่มวิดีโอตอนแรก</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {episodes.map((episode) => (
            <li key={episode.id} className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">ลำดับ {episode.order}</span>
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${episode.isPublished ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>{episode.isPublished ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</span>
                </div>
                <h3 className="font-semibold break-words text-slate-900">{episode.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{episode.description}</p>
              </div>
              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <button type="button" disabled={busy} onClick={() => editEpisode(episode)} aria-label={`แก้ไข ${episode.title}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:flex-none"><Pencil size={15} /> แก้ไข</button>
                <button type="button" disabled={busy} onClick={() => void removeEpisode(episode)} aria-label={`ลบ ${episode.title}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 sm:flex-none"><Trash2 size={15} /> ลบ</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
