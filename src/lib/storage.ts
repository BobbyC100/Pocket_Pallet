// MVP local "store" using localStorage (client only). Replace with Supabase later.

type BriefMeta = { id: string; name: string; stage: string; updatedAt: string };

const KEY = "banyan_local_briefs_meta_v1";

export function listLocalBriefs(): BriefMeta[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function upsertLocalBrief(meta: BriefMeta) {
  if (typeof window === "undefined") return;
  const list = listLocalBriefs().filter(b => b.id !== meta.id);
  list.unshift(meta);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 6)));
}
