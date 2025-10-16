'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MerchantStreetView from '@/components/MerchantStreetView';
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
  about: string | null;
  hero_image: string | null;
  contact: { website?: string; phone?: string; instagram?: string } | null;
  created_at: string;
};

type Wine = {
  id: number;
  producer: string | null;
  cuvee: string | null;
  vintage: string | null;
  region: string | null;
  appellation: string | null;
  style: string | null;
  volume_ml: number | null;
};

type Product = {
  id: number;
  wine_id: number | null;
  product_url: string;
  title_raw: string | null;
};

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string; // Can be ID or slug

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (merchantId) {
      loadMerchantData();
    }
  }, [merchantId]);

  const loadMerchantData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch merchant details from new merchants API
      const merchantRes = await api.get(`/api/v1/merchants/${merchantId}`);
      setMerchant(merchantRes.data);

      // TODO: Link merchants to scraper sources to show wine inventory
      // For now, we'll show empty state or fetch by merchant name
      // This will be connected once we add merchant_id to sources table

    } catch (err: any) {
      console.error('Failed to load merchant:', err);
      setError(err?.response?.data?.detail || 'Failed to load merchant details');
    } finally {
      setLoading(false);
    }
  };

  const getHeroImage = (name: string): string => {
    if (name.toLowerCase().includes('buvons')) return '/images/buvons-hero.jpg';
    if (name.toLowerCase().includes('monarch')) return '/images/monarch-hero.jpg';
    return '/images/wine-shop-hero.jpg';
  };

  const getMerchantType = (name: string): string => {
    if (name.toLowerCase().includes('buvons')) return 'French Bistro · Natural Wine';
    return 'Wine Shop · Natural Wine';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wine-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-800">Loading merchant...</p>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Merchant not found'}</p>
          <Link href="/merchants" className="text-wine-600 hover:text-wine-700">
            ← Back to Merchants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-800">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-gradient-to-br from-wine-800 to-wine-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-8 left-8 text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold">{merchant.name}</h1>
          <p className="text-lg md:text-xl mt-2">
            {merchant.type === 'bistro' && 'French Bistro · Natural Wine'}
            {merchant.type === 'bar' && 'Wine Bar · Natural Wine'}
            {merchant.type === 'wine_shop' && 'Wine Shop · Natural Wine'}
            {!merchant.type && 'Wine Merchant · Natural Wine'}
          </p>
          {merchant.address && (
            <p className="text-sm md:text-base mt-2 opacity-90">{merchant.address}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {merchant.contact?.website && (
              <a
                href={merchant.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md text-sm border border-white/70 bg-white/10 backdrop-blur hover:bg-white/20 transition"
              >
                Visit Website
              </a>
            )}
            <Link
              href="/merchants"
              className="px-4 py-2 rounded-md text-sm border border-white/70 bg-white/10 backdrop-blur hover:bg-white/20 transition"
            >
              ← All Merchants
            </Link>
          </div>
          {merchant.tags && merchant.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {merchant.tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Wines Section */}
      <section className="px-6 md:px-20 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">Available Wines</h2>
          <p className="text-neutral-600">
            {wines.length > 0 
              ? `Explore ${wines.length} curated natural wines from this merchant`
              : 'No wines parsed yet. Check back soon!'}
          </p>
        </div>

        {wines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No wines available yet from this merchant.</p>
              <p className="text-sm text-gray-500">
                We have {products.length} products that are being processed. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wines.map((wine) => (
              <Card key={wine.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Producer & Wine Name */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {wine.producer || 'Unknown Producer'}
                      </h3>
                      {wine.cuvee && wine.cuvee !== wine.producer && (
                        <p className="text-md text-gray-700 mt-1">{wine.cuvee}</p>
                      )}
                    </div>

                    {/* Wine Details */}
                    <div className="space-y-2 text-sm">
                      {wine.vintage && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Vintage:</span>
                          <span className="font-medium text-gray-900">{wine.vintage}</span>
                        </div>
                      )}
                      
                      {wine.region && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Region:</span>
                          <span className="text-gray-900">{wine.region}</span>
                        </div>
                      )}

                      {wine.appellation && wine.appellation !== wine.region && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Appellation:</span>
                          <span className="text-gray-900">{wine.appellation}</span>
                        </div>
                      )}

                      {wine.style && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Style:</span>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-wine-100 text-wine-800">
                            {wine.style}
                          </span>
                        </div>
                      )}

                      {wine.volume_ml && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Size:</span>
                          <span className="text-gray-900">{wine.volume_ml}ml</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const product = products.find(p => p.wine_id === wine.id);
                          if (product?.product_url) {
                            window.open(product.product_url, '_blank');
                          } else {
                            window.open(merchant.base_url, '_blank');
                          }
                        }}
                      >
                        View on Website
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Street View Section */}
      {merchant.geo && merchant.geo.lat && merchant.geo.lng && (
        <MerchantStreetView 
          lat={merchant.geo.lat} 
          lng={merchant.geo.lng} 
          merchantName={merchant.name}
        />
      )}

      {/* About Section */}
      <section className="px-6 md:px-20 py-10 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-4">About {merchant.name}</h3>
          <p className="text-neutral-700 leading-relaxed mb-6">
            {merchant.about || `${merchant.name} is a curated wine merchant specializing in natural wines. Discover unique bottles from small producers and family vineyards.`}
          </p>
          <div className="flex justify-center gap-4">
            {merchant.contact?.website && (
              <a
                href={merchant.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-wine-600 text-white rounded-md hover:bg-wine-700 transition"
              >
                Visit Website
              </a>
            )}
            <Link
              href="/merchants"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Browse More Merchants
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-neutral-500 bg-white">
        © 2025 Pocket Pallet — Discover Natural Wine
      </footer>
    </div>
  );
}

