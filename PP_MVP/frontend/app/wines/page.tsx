"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Wine {
  id: number;
  name: string;
  price_usd: number | null;
  url: string | null;
  region: string | null;
  grapes: string | null;
  vintage: string | null;
  notes: string | null;
  created_at: string;
}

export default function WinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loadingWines, setLoadingWines] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchWines();
    }
  }, [user]);

  async function fetchWines() {
    try {
      const response = await axios.get(`${API_URL}/api/v1/wines?limit=500`);
      setWines(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load wines");
    } finally {
      setLoadingWines(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-wine-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-wine-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Pocket Pallet</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-wine-600 hover:text-wine-700"
              >
                ← Dashboard
              </button>
              <span className="text-sm text-gray-600">{user.username}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-normal text-gray-900">Your Collection</h1>
          <p className="text-gray-700 mt-1">
            {wines.length} {wines.length === 1 ? 'bottle' : 'bottles'} to explore
          </p>
        </div>

        {loadingWines ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : wines.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wines yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by importing a CSV file.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/imports/new")}
                className="px-4 py-2 bg-wine-600 text-white rounded-md hover:bg-wine-700"
              >
                Import Wines
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wines.map((wine) => (
              <div
                key={wine.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:border-wine-300 hover:shadow-sm transition-all"
              >
                {/* Wine Name */}
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {wine.name}
                </h3>

                {/* Wine Details */}
                <div className="space-y-2 text-sm">
                  {wine.region && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{wine.region}</span>
                    </div>
                  )}

                  {wine.grapes && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span className="line-clamp-1">{wine.grapes}</span>
                    </div>
                  )}

                  {wine.vintage && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{wine.vintage}</span>
                    </div>
                  )}

                  {wine.price_usd && (
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>${wine.price_usd.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {wine.notes && (
                  <p className="mt-3 text-xs text-gray-500 line-clamp-2 border-t border-gray-100 pt-3">
                    {wine.notes}
                  </p>
                )}

                {/* Link */}
                {wine.url && (
                  <a
                    href={wine.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-wine-600 hover:text-wine-700"
                  >
                    <span>View details</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

