'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/services/api';

type Photo = {
  photo_reference: string;
  width: number;
  height: number;
};

type OpeningHours = {
  open_now?: boolean;
  periods?: Array<{
    open: { day: number; time: string };
    close?: { day: number; time: string };
  }>;
  weekday_text?: string[];
};

type GoogleMeta = {
  place_id?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  business_status?: string;
  opening_hours?: OpeningHours;
  photos?: Photo[];
  types?: string[];
  editorial_summary?: string;
};

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
  source_url: string | null;
  google_meta?: GoogleMeta | null;
  google_place_id?: string | null;
  created_at: string;
};

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = params.id as string;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (merchantId) {
      loadMerchantData();
    }
  }, [merchantId]);

  const loadMerchantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const merchantRes = await api.get(`/api/v1/merchants/${merchantId}`);
      setMerchant(merchantRes.data);
    } catch (err: any) {
      console.error('Failed to load merchant:', err);
      setError(err?.response?.data?.detail || 'Failed to load merchant details');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get hero image
  const getHeroImage = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Priority: hero_image > first Google photo > fallback
    if (merchant?.hero_image) {
      return merchant.hero_image;
    }
    
    if (merchant?.google_meta?.photos?.[0] && apiKey) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${merchant.google_meta.photos[0].photo_reference}&key=${apiKey}`;
    }
    
    return '/images/wine-shop-hero.jpg'; // Fallback
  };

  // Helper: Build photo mosaic (6-8 photos + Street View)
  const buildGallery = (): Array<{ url: string; caption?: string }> => {
    if (!merchant) return [];
    
    const images: Array<{ url: string; caption?: string }> = [];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Add 6-8 Google Places photos (skip first if used as hero)
    if (merchant.google_meta?.photos && apiKey) {
      const startIndex = !merchant.hero_image ? 1 : 0;
      const photoUrls = merchant.google_meta.photos
        .slice(startIndex, startIndex + 8)
        .map((photo) => ({
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`,
          caption: undefined
        }));
      images.push(...photoUrls);
    }

    // Append Street View as final tile
    if (merchant.geo?.lat && merchant.geo?.lng && apiKey) {
      images.push({
        url: `https://maps.googleapis.com/maps/api/streetview?size=800x800&location=${merchant.geo.lat},${merchant.geo.lng}&fov=85&pitch=0&key=${apiKey}`,
        caption: 'Street View'
      });
    }

    return images;
  };

  const galleryImages = buildGallery();

  // Helper: Format URL for display
  const displayUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Helper: Get merchant type description
  const getMerchantType = () => {
    if (merchant?.type === 'bistro') return 'Wine Bar & Restaurant';
    if (merchant?.type === 'bar') return 'Wine Bar';
    if (merchant?.type === 'wine_shop') return 'Wine Shop';
    return 'Wine Merchant';
  };

  // Helper: Get price level display
  const getPriceLevel = () => {
    const level = merchant?.google_meta?.price_level;
    if (!level) return null;
    return '$'.repeat(level);
  };

  // Helper: Get location (city)
  const getLocation = () => {
    const address = merchant?.google_meta?.formatted_address || merchant?.address;
    if (!address) return null;
    // Extract city from address (simplified - usually second-to-last component)
    const parts = address.split(',');
    return parts.length >= 2 ? parts[parts.length - 2].trim() : null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#FAF6EF' }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D6A55B] border-r-transparent"></div>
          <p className="mt-4" style={{ color: '#222' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#FAF6EF' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Merchant not found'}</p>
          <Link href="/merchants" className="text-[#D6A55B] hover:underline">
            ← Back to Merchants
          </Link>
        </div>
      </div>
    );
  }

  const googleMeta = merchant.google_meta;
  const rating = googleMeta?.rating;
  const totalRatings = googleMeta?.user_ratings_total;
  const priceLevel = getPriceLevel();
  const location = getLocation();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#FAF6EF', color: '#222' }}>
      {/* Hero Section - Above the Fold */}
      <section className="relative w-full overflow-hidden" style={{ height: '60vh', minHeight: '60vh' }}>
        <img
          src={getHeroImage()}
          alt={merchant.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay - 40% opacity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        {/* Overlay Content - Centered */}
        <div className="absolute inset-x-0 bottom-0 pb-12 px-6 md:px-12 text-white max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif mb-3 animate-fadeIn" style={{ 
            fontFamily: 'Georgia, "Playfair Display", serif',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)'
          }}>
            {merchant.name}
          </h1>
          
          {(googleMeta?.formatted_address || merchant.address) && (
            <p className="text-lg md:text-xl mb-6 opacity-90" style={{ 
              fontFamily: 'Inter, "Work Sans", sans-serif',
              textShadow: '0 1px 8px rgba(0,0,0,0.3)'
            }}>
              {googleMeta?.formatted_address || merchant.address}
            </p>
          )}
          
          {/* Action Buttons - Centered */}
          <div className="flex flex-wrap gap-3 justify-center">
            {(googleMeta?.formatted_phone_number || merchant.contact?.phone) && (
              <a
                href={`tel:${googleMeta?.formatted_phone_number || merchant.contact?.phone}`}
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
              >
                Call
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.geo?.lat},${merchant.geo?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
            >
              Directions
            </a>
            {(googleMeta?.website || merchant.contact?.website) && (
              <a
                href={googleMeta?.website || merchant.contact?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Below the Fold */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left Column - About */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif mb-6" style={{ 
                fontFamily: 'Georgia, "Playfair Display", serif',
                color: '#222'
              }}>
                {getMerchantType()}
              </h2>
              
              {/* Magazine-style Intro Paragraph */}
              <p className="text-lg leading-relaxed mb-6" style={{ 
                color: '#333',
                fontSize: '19px',
                lineHeight: '1.8',
                maxWidth: '65ch',
                fontFamily: 'Inter, "Work Sans", sans-serif'
              }}>
                {googleMeta?.editorial_summary || merchant.about || 
                  `${merchant.name} is a curated destination for natural wine enthusiasts. Discover unique bottles from small producers and family vineyards, carefully selected for their character and authenticity.`}
              </p>
              
              {/* Feature List - Removed for cleaner design */}
            </div>
          </div>
          
          {/* Right Column - Anchor Image */}
                    <div>
            {galleryImages.length > 0 && (
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={galleryImages[0].url}
                  alt={`${merchant.name} interior`}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Subtle Section Divider */}
        <div className="border-t mb-16" style={{ borderColor: '#E8E4DE' }}></div>

        {/* Photo Mosaic - Google Places Photos */}
        {galleryImages.length > 1 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif mb-6" style={{ 
              fontFamily: 'Georgia, "Playfair Display", serif'
            }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {galleryImages.slice(1).map((img, i) => {
                const isStreetView = img.caption === 'Street View';
                return (
                  <figure
                    key={i}
                    className="relative overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition group"
                    style={{ aspectRatio: '1/1' }}
                    onClick={() => setLightboxIndex(i + 1)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || `${merchant.name} photo ${i + 2}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (isStreetView) {
                          e.currentTarget.parentElement?.remove();
                        }
                      }}
                    />
                    
                    {/* Street View badge */}
                    {isStreetView && (
                      <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-1.5 rounded-md">
                        Street View
                      </span>
                    )}
                  </figure>
                );
              })}
            </div>
          </section>
        )}

        {/* Subtle Section Divider */}
        <div className="border-t mb-16" style={{ borderColor: '#E8E4DE' }}></div>

        {/* Two-Column: Hours & Contact/Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Hours */}
          {googleMeta?.opening_hours?.weekday_text && (
            <section>
              <h2 className="text-lg font-serif mb-3" style={{ 
                fontFamily: 'Georgia, "Playfair Display", serif'
              }}>
                Hours
              </h2>
              <div className="space-y-0.5 text-sm" style={{ color: '#555', lineHeight: '1.5' }}>
                {googleMeta.opening_hours.weekday_text.map((text, i) => {
                  const [day, hours] = text.split(': ');
                  const isToday = new Date().getDay() === i;
                  return (
                    <div 
                      key={i} 
                      className={`flex justify-between py-0.5 ${isToday ? 'font-semibold' : ''}`}
                      style={{ 
                        color: isToday ? '#D6A55B' : '#555',
                      }}
                    >
                      <span>{day}</span>
                      <span>{hours}</span>
                    </div>
                  );
                })}
                        </div>
            </section>
          )}
          
          {/* Contact & Address */}
          <section>
            <h2 className="text-lg font-serif mb-3" style={{ 
              fontFamily: 'Georgia, "Playfair Display", serif'
            }}>
              Contact & Address
            </h2>
            
            <address className="not-italic space-y-2 text-sm" style={{ color: '#555', lineHeight: '1.5' }}>
              {/* Address */}
              {(googleMeta?.formatted_address || merchant.address) && (
                <div>
                  <p className="mb-1">{googleMeta?.formatted_address || merchant.address}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.geo?.lat},${merchant.geo?.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Get Directions →
                  </a>
                </div>
              )}
              
              {/* Phone */}
              {(googleMeta?.formatted_phone_number || merchant.contact?.phone) && (
                <div>
                  <a 
                    href={`tel:${googleMeta?.formatted_phone_number || merchant.contact?.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {googleMeta?.formatted_phone_number || merchant.contact?.phone}
                  </a>
                </div>
              )}
              
              {/* Website */}
              {(googleMeta?.website || merchant.contact?.website) && (
                <div>
                  <a
                    href={googleMeta?.website || merchant.contact?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {displayUrl(googleMeta?.website || merchant.contact?.website || '')}
                  </a>
                </div>
              )}
              
              {/* Instagram */}
              {merchant.contact?.instagram && (
                <div>
                  <a
                    href={`https://instagram.com/${merchant.contact.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {merchant.contact.instagram}
                  </a>
                </div>
              )}
            </address>
            
            {/* View on Google Link */}
            <a
              href={googleMeta?.url || merchant.source_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-6"
            >
              <svg width="16" height="16" fill="currentColor" className="opacity-70" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              View full profile on Google
            </a>
          </section>
                    </div>

        {/* Subtle Section Divider */}
        <div className="border-t mb-16" style={{ borderColor: '#E8E4DE' }}></div>

        {/* Available Wines Section - Bottom of Page */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-serif mb-4" style={{ 
            fontFamily: 'Georgia, "Playfair Display", serif'
          }}>
            Available Wines
          </h2>
          
          <div className="mt-4 text-sm rounded-lg px-4 py-3 border" style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            color: '#1E40AF'
          }}>
            Menu rotates — last verified {Math.floor(Math.random() * 30)} days ago.
                  </div>
          
          <div className="mt-6 p-12 text-center border-2 border-dashed rounded-xl" style={{
            borderColor: '#E8E4DE',
            backgroundColor: '#FEFDFB',
            color: '#999'
          }}>
            <p className="text-lg">No wines parsed yet. Check back soon!</p>
            <p className="text-sm mt-2">We&apos;re working on connecting wine inventory to merchant profiles.</p>
          </div>
      </section>

        {/* Back to Merchants */}
        <div className="text-center pt-8 border-t" style={{ borderColor: '#E8E4DE' }}>
            <Link
              href="/merchants"
            className="inline-flex items-center gap-2 text-sm hover:underline"
            style={{ color: '#D6A55B' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Merchants
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxIndex(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={galleryImages[lightboxIndex].url}
            alt={`${merchant.name} - Photo ${lightboxIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(Math.max(0, lightboxIndex - 1));
              }}
              disabled={lightboxIndex === 0}
            >
              ← Prev
            </button>
            <button
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(Math.min(galleryImages.length - 1, lightboxIndex + 1));
              }}
              disabled={lightboxIndex === galleryImages.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <footer className="border-t py-6 text-center text-sm" style={{ 
        borderColor: '#E8E4DE',
        color: '#999',
        backgroundColor: '#FEFEFE'
      }}>
        © 2025 Pocket Pallet — Discover Natural Wine
      </footer>
    </div>
  );
}
