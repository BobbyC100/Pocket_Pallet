"use client";

import * as React from "react";
import TastingNotesDrawer from "./TastingNotesDrawer";

type Wine = {
  id: number;
  name: string;
  region?: string | null;
  vintage?: string | null;
  price_usd?: number | null;
  notes?: string | null;
  status?: string | null;
  rating?: number | null;
};

export default function WineCard({ wine, onSaved }: { wine: Wine; onSaved?: () => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-wine-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{wine.name}</h3>
          <p className="mt-1 text-sm text-gray-700">
            {wine.region ?? "—"} {wine.vintage ? `• ${wine.vintage}` : ""}
          </p>
          {wine.price_usd != null && (
            <p className="mt-1 text-sm text-gray-700">${Number(wine.price_usd).toFixed(2)}</p>
          )}
          {wine.notes && (
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{wine.notes}</p>
          )}
        </div>
        
        {/* Status Badge */}
        {wine.status && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-wine-100 text-wine-700">
            {wine.status}
          </span>
        )}
      </div>

      {/* Rating */}
      {wine.rating && (
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${star <= wine.rating! ? 'text-wine-600' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          className="px-3.5 py-2 bg-wine-600 text-white rounded-md hover:bg-wine-700 transition-colors text-sm font-medium"
          onClick={() => setOpen(true)}
        >
          Add Tasting Notes
        </button>
      </div>

      <TastingNotesDrawer
        open={open}
        onClose={() => setOpen(false)}
        wine={{ id: wine.id, name: wine.name }}
        onSaved={() => {
          setOpen(false);
          onSaved?.();
        }}
      />
    </div>
  );
}

