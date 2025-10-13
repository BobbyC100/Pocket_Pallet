"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import api from "@/app/services/api";
import type { TastingNoteCreate } from "@/app/types/tasting";
import {
  CLARITY, INTENSITY, AROMA_PRIMARY, AROMA_SECONDARY, AROMA_TERTIARY,
} from "@/app/types/tasting";

type Props = {
  open: boolean;
  onClose: () => void;
  wine: { id: number; name: string };
  onSaved?: () => void;
};

export default function TastingNotesDrawer({ open, onClose, wine, onSaved }: Props) {
  const { register, handleSubmit, reset } = useForm<TastingNoteCreate>({
    defaultValues: { 
      wine_id: wine.id, 
      palate_sweetness: 1, 
      palate_acidity: 3, 
      palate_tannin: 2, 
      palate_body: 3, 
      palate_alcohol: 3, 
      finish_length: 2 
    },
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Reset when wine changes or drawer opens
    if (open) {
      reset({ 
        wine_id: wine.id, 
        palate_sweetness: 1, 
        palate_acidity: 3, 
        palate_tannin: 2, 
        palate_body: 3, 
        palate_alcohol: 3, 
        finish_length: 2 
      });
    }
  }, [open, wine?.id, reset]);

  async function onSubmit(values: TastingNoteCreate) {
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/v1/tasting-notes", values);
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to save tasting note.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-xl transition-transform">
        <div className="p-6 border-b border-gray-200 bg-wine-50">
          <h2 className="text-xl text-gray-900">Add Tasting Notes</h2>
          <p className="text-sm text-gray-700 mt-1">{wine?.name}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto h-[calc(100%-72px)]">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Appearance */}
          <section>
            <h3 className="text-sm font-medium text-gray-900">Appearance</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Clarity</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        {...register("appearance_clarity")}>
                  <option value="">—</option>
                  {CLARITY.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Color</label>
                <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500"
                       placeholder="e.g., Pale Straw, Ruby"
                       {...register("appearance_color")} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Intensity</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        {...register("appearance_intensity")}>
                  <option value="">—</option>
                  {INTENSITY.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Aroma */}
          <section>
            <h3 className="text-sm font-medium text-gray-900">Aroma</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Primary</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        {...register("aroma_primary")}>
                  <option value="">—</option>
                  {AROMA_PRIMARY.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Secondary</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        {...register("aroma_secondary")}>
                  <option value="">—</option>
                  {AROMA_SECONDARY.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tertiary</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        {...register("aroma_tertiary")}>
                  <option value="">—</option>
                  {AROMA_TERTIARY.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Palate */}
          <section>
            <h3 className="text-sm font-medium text-gray-900">Palate</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: "palate_sweetness", label: "Sweetness (1 Bone Dry → 5 Sweet)" },
                { name: "palate_acidity",   label: "Acidity (1 Low → 5 High)" },
                { name: "palate_tannin",    label: "Tannin (1 Low → 5 High)" },
                { name: "palate_body",      label: "Body (1 Light → 5 Full)" },
                { name: "palate_alcohol",   label: "Alcohol (1 Low → 5 High)" },
                { name: "finish_length",    label: "Finish (1 Short → 5 Long)" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm text-gray-700 mb-1">{f.label}</label>
                  <input type="range" min={1} max={5}
                         className="w-full"
                         {...register(f.name as keyof TastingNoteCreate, { valueAsNumber: true })} />
                </div>
              ))}
            </div>
          </section>

          {/* Flavor characteristics */}
          <section>
            <h3 className="text-sm font-medium text-gray-900">Flavor characteristics</h3>
            <textarea
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500"
              placeholder="e.g., black cherry, cedar, dried rose"
              rows={3}
              {...register("flavor_characteristics")}
            />
          </section>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2.5 bg-wine-600 text-white rounded-md hover:bg-wine-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Save Notes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

