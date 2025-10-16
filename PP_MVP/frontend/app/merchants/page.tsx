'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/app/services/api';

type Merchant = {
  id: number;
  name: string;
  base_url: string;
  enabled: boolean;
  last_run_at: string | null;
  wine_count?: number;
  product_count?: number;
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
      // Fetch all sources (merchants)
      const sourcesRes = await api.get('/api/v1/scraper/sources?limit=100');
      const sources = sourcesRes.data;

      // Fetch wine counts for each merchant
      const winesRes = await api.get('/api/v1/scraper/wines?limit=1000');
      const wines = winesRes.data;

      // Fetch product counts
      const productsRes = await api.get('/api/v1/scraper/products?limit=1000');
      const products = productsRes.data;

      // Count wines and products per source
      const merchantsWithCounts = sources.map((source: Merchant) => {
        const sourceProducts = products.filter((p: any) => p.source_id === source.id);
        const sourceWineIds = new Set(sourceProducts.map((p: any) => p.wine_id).filter(Boolean));
        
        return {
          ...source,
          product_count: sourceProducts.length,
          wine_count: sourceWineIds.size
        };
      });

      setMerchants(merchantsWithCounts.filter((m: Merchant) => m.enabled));
    } catch (err: any) {
      console.error('Failed to load merchants:', err);
      setError(err?.response?.data?.detail || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const getMerchantType = (url: string): string => {
    if (url.includes('buvons')) return 'Bistro & Shop';
    if (url.includes('monarch')) return 'Wine Shop';
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
              <Link key={merchant.id} href={`/merchants/${merchant.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-wine-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">
                      {merchant.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {getMerchantType(merchant.base_url)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Wine Count */}
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Wines Available</span>
                        <span className="text-lg font-semibold text-wine-600">
                          {merchant.wine_count || 0}
                        </span>
                      </div>

                      {/* Product Count */}
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Product Listings</span>
                        <span className="text-sm font-medium text-gray-700">
                          {merchant.product_count || 0}
                        </span>
                      </div>

                      {/* Last Updated */}
                      {merchant.last_run_at && (
                        <div className="pt-2">
                          <p className="text-xs text-gray-500">
                            Updated {new Date(merchant.last_run_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* View Button */}
                      <div className="pt-2">
                        <span className="text-sm text-wine-600 font-medium hover:text-wine-700">
                          View Wines →
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

