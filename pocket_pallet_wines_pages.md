
# Pocket Pallet — Wines Pages (Next.js 14 + FastAPI)

This document adds a **Wines list** (`/wines`) and a **Wine detail** page (`/wines/[id]`) to the Pocket Pallet frontend, wired to your FastAPI backend.

---

## Overview

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind, Axios
- **Backend**: FastAPI endpoints (`/api/v1/wines`)
- **Features**: Search, pagination, detail view
- **Env**: `NEXT_PUBLIC_API_URL=https://pocket-pallet.onrender.com/api/v1`

---

## 0) Backend — Confirm Endpoints

These should exist (as documented). If not, add them or adapt.

- `GET /api/v1/wines?skip=0&limit=25[&q=verde]` — list wines (search optional)
- `GET /api/v1/wines/count[?q=verde]` — total count (search-aware)
- `GET /api/v1/wines/{wine_id}` — single wine

> Optional indexes to speed up search (run via migration or psql):
> ```sql
> CREATE INDEX IF NOT EXISTS idx_wines_name_lower   ON wines (LOWER(name));
> CREATE INDEX IF NOT EXISTS idx_wines_region_lower ON wines (LOWER(region));
> CREATE INDEX IF NOT EXISTS idx_wines_grapes_lower ON wines (LOWER(grapes));
> ```

---

## 1) Types

**File:** `PP_MVP/frontend/app/types/wine.ts`
```ts
export type Wine = {
  id: number;
  name: string;
  price_usd?: number | null;
  url?: string | null;
  region?: string | null;
  grapes?: string | null;
  vintage?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
```

---

## 2) Wines Table (client component)

**File:** `PP_MVP/frontend/app/components/WinesTable.tsx`
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { Wine } from "@/app/types/wine";

const PAGE_SIZE = 25;

export default function WinesTable() {
  const API = process.env.NEXT_PUBLIC_API_URL; // e.g. https://pocket-pallet.onrender.com/api/v1

  const [rows, setRows] = useState<Wine[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const skip = useMemo(() => (page - 1) * PAGE_SIZE, [page]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    if (!API) return;
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const [countRes, listRes] = await Promise.all([
          axios.get(`${API}/wines/count`, { params: { q } }),
          axios.get(`${API}/wines`, { params: { q, skip, limit: PAGE_SIZE } }),
        ]);

        if (cancelled) return;
        setTotal(countRes.data?.count ?? 0);
        setRows(listRes.data ?? []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.response?.data?.detail || err?.message || "Failed to load wines");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [API, q, skip]);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("q") || "").trim();
    setPage(1);
    setQ(value);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Wines</h1>
        <div className="text-sm text-slate-600">{total} total</div>
      </div>

      {/* Search */}
      <form onSubmit={onSearch} className="flex items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, region, grapes…"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Wine</th>
              <th className="px-3 py-2">Vintage</th>
              <th className="px-3 py-2">Region</th>
              <th className="px-3 py-2">Grapes</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-t">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-rose-700">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-slate-600">
                  No wines found{q ? ` for "${q}"` : ""}.
                </td>
              </tr>
            ) : (
              rows.map((w) => (
                <tr key={w.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{w.name}</div>
                    <div className="text-xs text-slate-500 truncate">{w.url ?? ""}</div>
                  </td>
                  <td className="px-3 py-2">{w.vintage ?? "-"}</td>
                  <td className="px-3 py-2">{w.region ?? "-"}</td>
                  <td className="px-3 py-2 truncate max-w-[240px]">{w.grapes ?? "-"}</td>
                  <td className="px-3 py-2">
                    {typeof w.price_usd === "number" ? `$${w.price_usd.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a href={`/wines/${w.id}`} className="text-indigo-600 hover:underline">
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Prev
        </button>
        <div className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </div>
        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## 3) Wines Page Route

**File:** `PP_MVP/frontend/app/wines/page.tsx`
```tsx
import WinesTable from "@/app/components/WinesTable";

export default function WinesPage() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <WinesTable />
    </div>
  );
}
```

---

## 4) Wine Detail Page

Server component that fetches the wine by ID. Includes a small client block for copying the product URL.

**File:** `PP_MVP/frontend/app/wines/[id]/page.tsx`
```tsx
import type { Wine } from "@/app/types/wine";

export const dynamic = "force-dynamic"; // always fetch fresh

async function getWine(id: string): Promise<Wine> {
  const API = process.env.NEXT_PUBLIC_API_URL; // server can read this too
  const res = await fetch(`${API}/wines/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load wine");
  return res.json();
}

export default async function WineDetailPage({ params }: { params: { id: string } }) {
  const wine = await getWine(params.id);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{wine.name}</h1>
        <p className="text-slate-600">ID #{wine.id}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Info label="Vintage" value={wine.vintage} />
        <Info label="Region" value={wine.region} />
        <Info label="Grapes" value={wine.grapes} />
        <Info
          label="Price (USD)"
          value={
            typeof wine.price_usd === "number" ? `$${wine.price_usd.toFixed(2)}` : undefined
          }
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-700">Product URL</div>
        {wine.url ? <CopyUrl url={wine.url} /> : <span className="text-slate-500">—</span>}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-700">Notes</div>
        <div className="min-h-[56px] whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
          {wine.notes || "—"}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-900">{value || "—"}</div>
    </div>
  );
}

function CopyUrl({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2">
      <a href={url} target="_blank" className="truncate text-indigo-600 hover:underline">
        {url}
      </a>
      <button
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); } catch {}
        }}
        className="ml-auto rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
      >
        Copy
      </button>
    </div>
  );
}
```

---

## 5) Dashboard Link (optional)

Add a link or card on `/dashboard`:
```tsx
<a href="/wines" className="rounded-md border px-4 py-3 hover:bg-slate-50">
  View Wines →
</a>
```

---

## 6) Environment Variable

Ensure the frontend has:
```
NEXT_PUBLIC_API_URL=https://pocket-pallet.onrender.com/api/v1
```
Redeploy the frontend after changing.

---

## 7) Quick Tests

- API:
  ```bash
  curl "https://pocket-pallet.onrender.com/api/v1/wines?skip=0&limit=5"
  curl "https://pocket-pallet.onrender.com/api/v1/wines/count"
  ```

- Frontend:
  - Visit `/wines` → see table, search, pagination
  - Click a row → `/wines/[id]` detail
  - Open product URL → new tab

---

## 8) Future Enhancements

- Sort options (Created desc, Vintage, Price)
- Filters (Region, Vintage range, Price range)
- Row status chips (“Imported”, “Flagged”, “Duplicate”)
- Edit/Delete actions (when you add PUT/DELETE endpoints)
- CSV export of filtered list

---

**End of document.**
