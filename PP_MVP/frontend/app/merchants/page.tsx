'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/app/services/api';

type Merchant = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  address: string | null;
  geo: { lat: number; lng: number } | null;
  country_code: string | null;
  tags: string[] | null;
  contact: { website?: string } | null;
  created_at: string;
};

export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch merchants from new API
      const res = await api.get('/api/v1/merchants?limit=100');
      setMerchants(res.data);
    } catch (err: any) {
      console.error('Failed to load merchants:', err);
      setError(err?.response?.data?.detail || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const getMerchantType = (type: string | null): string => {
    if (type === 'bistro') return 'Bistro & Shop';
    if (type === 'bar') return 'Wine Bar';
    if (type === 'wine_shop') return 'Wine Shop';
    return 'Wine Merchant';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wine-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wine-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-800">Loading merchants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Wine Merchants</h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover natural wine shops and bistros
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {merchants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No merchants found yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Check back soon as we add more wine shops and bistros!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchants.map((merchant) => (
              <Link key={merchant.id} href={`/merchants/${merchant.slug || merchant.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-wine-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">
                      {merchant.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getMerchantType(merchant.type)}
                    </p>
                    {merchant.address && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {merchant.address}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Tags */}
                      {merchant.tags && merchant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {merchant.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-wine-100 text-wine-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Location */}
                      {merchant.geo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs">
                            {merchant.country_code || 'Location available'}
                          </span>
                        </div>
                      )}

                      {/* View Button */}
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <span className="text-sm text-wine-600 font-medium hover:text-wine-700">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-500 bg-white">
        © 2025 Pocket Pallet — Discover Natural Wine
      </footer>
    </div>
  );
}

