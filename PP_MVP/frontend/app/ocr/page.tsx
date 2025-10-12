"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OCRItem {
  name: string | null;
  vintage: string | null;
  price_usd: number | null;
  bottle_size: string | null;
  confidence: number;
  raw: string;
  status: "ok" | "review";
}

interface OCRResponse {
  ok: boolean;
  items: OCRItem[];
  meta: {
    pages: number;
    engine: string;
    threshold: number;
    grouping: string;
  };
}

export default function OCRPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);
    setResp(null);
    setError("");

    try {
      const r = await fetch(`${API_URL}/api/v1/ocr/wine-list`, {
        method: "POST",
        body: fd,
      });
      
      if (!r.ok) {
        const errorData = await r.json();
        throw new Error(errorData.detail || `HTTP error! status: ${r.status}`);
      }
      
      const j = await r.json();
      setResp(j);
    } catch (err: any) {
      setError(err.message || "Failed to process wine list");
    } finally {
      setLoading(false);
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResp(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-wine-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Pocket Pallet</span>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-wine-600 hover:text-wine-700"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-gray-900">Scan Wine List</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload a photo or PDF of a wine list to automatically extract wine details
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wine List (PDF or Image)
              </label>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg"
                onChange={onFileSelect}
                className="block w-full text-sm text-gray-900
                         file:mr-4 file:py-2.5 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-medium
                         file:bg-wine-50 file:text-wine-700
                         hover:file:bg-wine-100
                         cursor-pointer"
              />
              <p className="mt-2 text-xs text-gray-600">
                Supports PDF, PNG, JPG (max 25MB)
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-wine-600 px-4 py-2.5 text-white hover:bg-wine-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!file || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Upload & Parse"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {resp && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {resp.items.length} items extracted
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {resp.meta.pages} page{resp.meta.pages !== 1 ? "s" : ""} • 
                  Confidence threshold: {Math.round(resp.meta.threshold * 100)}% • 
                  Mode: {resp.meta.grouping}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {resp.items.filter(i => i.status === "ok").length} ready
                </div>
                <div className="text-sm text-gray-600">
                  {resp.items.filter(i => i.status === "review").length} need review
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {resp.items.map((it, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${
                    it.status === "ok"
                      ? "border-green-200 bg-green-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {it.name || <span className="italic text-gray-500">No name extracted</span>}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        it.status === "ok"
                          ? "bg-green-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {it.status} • {Math.round(it.confidence * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Vintage:</span>{" "}
                      {it.vintage || "—"}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>{" "}
                      {typeof it.price_usd === "number"
                        ? `$${it.price_usd.toFixed(2)}`
                        : "—"}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {it.bottle_size || "—"}
                    </div>
                  </div>

                  <details className="mt-3">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                      View raw text
                    </summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono">
                      {it.raw}
                    </div>
                  </details>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Next step: Review and import these wines to your collection
              </p>
              <button
                onClick={() => router.push("/imports/new")}
                className="text-sm text-wine-600 hover:text-wine-700 font-medium"
              >
                Go to Manual Import →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

