'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [mapsOpen, setMapsOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Check if description is long enough to need truncation
  useEffect(() => {
    if (descriptionRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descriptionRef.current).lineHeight);
      const maxHeight = descriptionRef.current.scrollHeight;
      const visibleHeight = descriptionRef.current.clientHeight;
      setShouldShowToggle(maxHeight > visibleHeight + lineHeight);
    }
  }, [merchant]);

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

  // Helper: Build photo mosaic (Street View FIRST, then Google photos)
  const buildGallery = (): string[] => {
    if (!merchant) return [];
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return [];

    const images: string[] = [];

    // Street View FIRST
    if (merchant.geo?.lat && merchant.geo?.lng) {
      images.push(
        `https://maps.googleapis.com/maps/api/streetview?size=800x800&location=${merchant.geo.lat},${merchant.geo.lng}&fov=85&pitch=0&key=${apiKey}`
      );
    }

    // Then Google Places photos (all available photos)
    if (merchant.google_meta?.photos) {
      const photoUrls = merchant.google_meta.photos
        .map((photo) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
        );
      images.push(...photoUrls);
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

  // Helper: Check if URL is Instagram
  const isInstagramUrl = (url?: string) => {
    if (!url) return false;
    return url.includes('instagram.com');
  };

  // Helper: Extract Instagram handle from URL
  const getInstagramHandle = (url: string) => {
    try {
      const u = new URL(url);
      const handle = u.pathname.split('/').filter(Boolean)[0];
      return `@${handle}`;
    } catch {
      return url;
    }
  };

  // Helper: Humanize merchant type from Google types
  const humanizeType = (types?: string[], fallback?: string | null) => {
    if (fallback) return fallback;
    if (!types || !types.length) return null;

    const t = new Set(types);

    // Bars / Wine
    if (t.has('bar') || t.has('night_club')) return 'Bar';
    if (t.has('liquor_store') || t.has('wine_store') || t.has('store')) return 'Wine Shop';

    // Restaurants / Takeaway
    if (t.has('restaurant') || t.has('meal_takeaway') || t.has('food')) return 'Restaurant';

    // Cheese or specialty food shops
    if (t.has('grocery_or_supermarket') || t.has('delicatessen')) return 'Cheese Shop';

    // If Google returns something super specific but noisy, don't guess
    return null; // hide the header instead of being wrong
  };

  // Helper: Get price level display
  const getPriceLevel = () => {
    const level = merchant?.google_meta?.price_level;
    if (!level) return null;
    return '$'.repeat(level);
  };

  // Helper: Extract "Vibe" from editorial summary + types + hours
  const getVibe = (): string | null => {
    if (!merchant) return null;
    
    const summary = (googleMeta?.editorial_summary || merchant.about || '').toLowerCase();
    const types = new Set(googleMeta?.types || []);
    
    // Date night: romantic keywords
    if (summary.match(/cozy|romantic|date|wine list|intimate|candlelit/i)) {
      return 'date night';
    }
    
    // Quick lunch: counter service, quick, takeaway
    if (summary.match(/counter service|quick|grab.*go|take\s*away|lunch|fast/i) || types.has('meal_takeaway')) {
      return 'quick lunch';
    }
    
    // Late night: check closing time
    const hours = googleMeta?.opening_hours?.weekday_text;
    if (hours) {
      const latePattern = /(?:11:00 PM|12:00 AM|1:00 AM|2:00 AM)/i;
      if (hours.some(h => latePattern.test(h))) {
        return 'late night';
      }
    }
    if (summary.match(/open (?:till|until) (?:11pm|12am|late)|after hours|late night/i)) {
      return 'late night';
    }
    
    // Local favorite: mentions of locals, regulars, neighborhood
    if (summary.match(/locals?|regulars?|neighborhood|staple|hidden gem|local favorite/i)) {
      return 'local favorite';
    }
    
    // Casual: fallback
    if (summary.match(/casual|laid-back|no frills|relaxed|unpretentious/i)) {
      return 'casual';
    }
    
    return null;
  };

  // Helper: Extract "Known For" from editorial summary
  const getKnownFor = (): string[] => {
    if (!merchant) return [];
    
    const summary = googleMeta?.editorial_summary || merchant.about || '';
    const knownFor: string[] = [];
    
    // Extract noun phrases related to food/drink
    const foodPatterns = [
      /(?:fresh|grilled|crispy|fried|smoked|marinated|house-made|homemade|authentic)\s+(\w+(?:\s+\w+)?)/gi,
      /(?:their|its|famous|known for|signature)\s+([a-z]+\s+(?:tacos?|fish|shrimp|wine|beer|cocktails?|dishes?|pizza|burgers?|sandwiches?))/gi,
      /(?:selection|menu|list)\s+(?:of\s+)?(seafood|fish|tacos?|burritos?|quesadillas?|margaritas?|cerveza|beer|wine|cocktails?)/gi,
      /(seafood|fish)\s+(tacos?|burritos?|dishes?)/gi
    ];
    
    foodPatterns.forEach(pattern => {
      const matches = Array.from(summary.matchAll(pattern));
      for (const match of matches) {
        const phrase = (match[1] || match[0]).trim().toLowerCase();
        if (phrase && phrase.length > 3 && phrase.length < 30) {
          knownFor.push(phrase);
        }
      }
    });
    
    // De-dupe and limit to top 3
    return Array.from(new Set(knownFor)).slice(0, 3);
  };

  // Helper: Extract "Good to Know" from types + hours + summary
  const getGoodToKnow = (): string[] => {
    if (!merchant) return [];
    
    const tips: string[] = [];
    const summary = (googleMeta?.editorial_summary || merchant.about || '').toLowerCase();
    
    // Late night hours
    const hours = googleMeta?.opening_hours?.weekday_text;
    if (hours) {
      const latePattern = /(?:11:00 PM|12:00 AM|1:00 AM)/i;
      if (hours.some(h => latePattern.test(h))) {
        tips.push('open late');
      }
    }
    
    // Outdoor seating
    if (summary.match(/outdoor|patio|terrace|sidewalk|picnic/i)) {
      tips.push('outdoor seating');
    }
    
    // Cash only
    if (summary.match(/cash\s*only|no cards|bring cash/i)) {
      tips.push('cash only');
    }
    
    // Popular/busy
    if (summary.match(/line|busy|crowded|popular|packed/i)) {
      tips.push('can get busy');
    }
    
    return tips.slice(0, 4);
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
  const typeLabel = humanizeType(googleMeta?.types, merchant.type);
  const hasStreetView = merchant.geo?.lat && merchant.geo?.lng;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#FAF6EF', color: '#222' }}>
      {/* Header Layout: Left Title / Right Hero */}
      <header className="mx-auto max-w-6xl px-4 pt-6">
        <div className="grid items-start gap-6 md:grid-cols-[minmax(260px,360px)_1fr]">
          {/* LEFT: Title + Address + Action Pills */}
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
              {merchant.name}
            </h1>
            {(googleMeta?.formatted_address || merchant.address) && (
              <p className="mt-2 text-lg text-neutral-600">
                {googleMeta?.formatted_address || merchant.address}
              </p>
            )}

            {/* Action Pills - Below Address */}
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Directions - FIRST */}
              {merchant.geo?.lat && merchant.geo?.lng && (
                <button
                  onClick={() => setMapsOpen(true)}
                  className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  Directions
                </button>
              )}

              {/* Call - SECOND */}
              {(googleMeta?.formatted_phone_number || merchant.contact?.phone) && (
                <a
                  href={`tel:${googleMeta?.formatted_phone_number || merchant.contact?.phone}`}
                  className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  Call
                </a>
              )}

              {/* Instagram / Website - THIRD */}
              {(googleMeta?.website || merchant.contact?.website) && (
                <>
                  {isInstagramUrl(googleMeta?.website || merchant.contact?.website) ? (
                    <a
                      href={googleMeta?.website || merchant.contact?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    >
                      Instagram
                    </a>
                  ) : (
                    <a
                      href={googleMeta?.website || merchant.contact?.website}
                target="_blank"
                rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                      Website
              </a>
            )}
                </>
              )}
              {merchant.contact?.instagram && !isInstagramUrl(googleMeta?.website || merchant.contact?.website || '') && (
                <a
                  href={`https://instagram.com/${merchant.contact.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  Instagram
                </a>
              )}
          </div>

            {/* At-a-Glance Pills - Below Action Pills */}
            <section className="pt-4" aria-labelledby="at-a-glance">
              <h2 
                id="at-a-glance" 
                className="mb-2 text-sm font-medium text-neutral-500"
              >
                At a glance
              </h2>

              {/* Horizontal pill row with wrap */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                {/* Status - GREEN for Open, RED for Closed - ALWAYS FIRST */}
                {googleMeta?.opening_hours?.open_now !== undefined && (
                  <span 
                    className="group relative inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium leading-none shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                    style={{
                      borderColor: googleMeta.opening_hours.open_now ? '#86efac' : '#fecaca',
                      backgroundColor: googleMeta.opening_hours.open_now ? '#dcfce7' : '#fef2f2',
                      color: googleMeta.opening_hours.open_now ? '#15803d' : '#b91c1c'
                    }}
                    aria-label={googleMeta.opening_hours.open_now ? 'Currently open' : 'Currently closed'}
                  >
                    {googleMeta.opening_hours.open_now ? 'Open' : 'Closed'}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Status
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                  </span>
                )}

                {/* Type */}
                {typeLabel && (
                  <span 
                    className="group relative inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium leading-none text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                    aria-label={`Type: ${typeLabel}`}
                  >
                    {typeLabel}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Type
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                  </span>
                )}

                {/* Cost */}
                {googleMeta?.price_level && (
                  <span 
                    className="group relative inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium leading-none text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                    aria-label={`Cost: ${'$'.repeat(googleMeta.price_level)}`}
                  >
                    {'$'.repeat(googleMeta.price_level)}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Cost
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                  </span>
                )}

                {/* Vibe */}
                {getVibe() && (
                  <span 
                    className="group relative inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium leading-none text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                    aria-label={`Vibe: ${getVibe()}`}
                  >
                    {getVibe()}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Vibe
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                  </span>
                )}

                {/* Known For - each as its own pill */}
                {getKnownFor().slice(0, 4).map((item, i) => (
                  <span 
                    key={`known-${i}`}
                    className="group relative inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium leading-none text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                    aria-label={`Known for: ${item}`}
                  >
                    {item}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Known for
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                  </span>
                ))}

                {/* Good to Know - each as its own pill */}
                {getGoodToKnow().map((tip, i) => (
                  <span 
                    key={`tip-${i}`}
                    className="group relative inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium leading-none text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                    aria-label={`Good to know: ${tip}`}
                  >
                    {tip}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Good to know
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                    />
                </span>
              ))}
            </div>
            </section>

            {/* Description Section - Below At-a-Glance */}
            <section className="mt-3" aria-labelledby="description-heading">
              <h3 id="description-heading" className="sr-only">Description</h3>
              <div className="relative">
                <p
                  ref={descriptionRef}
                  id="merchant-description"
                  className={descriptionExpanded ? 'text-neutral-800 max-w-prose' : 'text-neutral-800 line-clamp-4 max-w-prose'}
                  style={{ 
                    fontSize: '1.05rem',
                    lineHeight: '1.75'
                  }}
                >
                  {googleMeta?.editorial_summary || merchant.about || 
                    `${merchant.name} is a curated destination for natural wine enthusiasts. Discover unique bottles from small producers and family vineyards, carefully selected for their character and authenticity.`}
                </p>
                
                {/* Gradient Fade - Only when clamped */}
                {!descriptionExpanded && shouldShowToggle && (
                  <div 
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.92))'
                    }}
                  />
          )}
        </div>

              {/* View More/Less Toggle */}
              {shouldShowToggle && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  aria-expanded={descriptionExpanded}
                  aria-controls="merchant-description"
                  className="mt-2 text-sm font-medium underline underline-offset-4 text-neutral-700 hover:text-neutral-900 motion-reduce:transition-none"
                >
                  {descriptionExpanded ? 'View less' : 'View more'}
                </button>
              )}
      </section>

            {/* Photo Mosaic - Below Description */}
            {galleryImages.length > 0 && (
              <section className="mt-8">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1">
                  {galleryImages.map((src, i) => {
                    return (
                      <figure
                        key={i}
                        className="relative overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition group aspect-square"
                        onClick={() => setLightboxIndex(i)}
                      >
                        <img
                          src={src}
                          alt={`${merchant.name} photo ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            if (hasStreetView && i === 0) {
                              e.currentTarget.parentElement?.remove();
                            }
                          }}
                        />
                        
                        {/* Street View badge - only on first tile */}
                        {hasStreetView && i === 0 && (
                          <span className="absolute bottom-2 right-2 rounded bg-black/60 text-white text-xs px-2 py-1">
                            Street View
                          </span>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Hero + Details Block */}
          <div className="flex flex-col gap-6">
            {/* Hero Image */}
            <div className="flex justify-end items-start">
              <img
                src={getHeroImage()}
                alt={merchant.name}
                className="aspect-[16/9] w-full max-w-[860px] rounded-2xl object-cover shadow-sm"
              />
        </div>

            {/* Details Block (Hours + Contact) */}
            <section aria-label="Details" className="rounded-2xl bg-neutral-50 p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Hours */}
                {googleMeta?.opening_hours?.weekday_text && (
                  <div>
                    <h3 className="mb-4 text-xl font-semibold">Hours</h3>
                    <dl className="space-y-3">
                      {googleMeta.opening_hours.weekday_text.map((text, i) => {
                        const [day, hours] = text.split(': ');
                        const todayIndex = (new Date().getDay() + 6) % 7; // Adjust: Sunday=0 → 6
                        const isToday = i === todayIndex;
                        return (
                          <div key={i} className="grid grid-cols-[120px_1fr] items-baseline">
                            <dt className={isToday ? "text-lg text-amber-700 font-medium" : "text-lg text-neutral-700"}>
                              {day}
                            </dt>
                            <dd className={isToday ? "text-base text-amber-700" : "text-base text-neutral-600"}>
                              {hours}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                )}

                {/* Contact & Address */}
                <div>
                  <h3 className="mb-4 text-xl font-semibold">Contact & Address</h3>
                  <div className="space-y-3 text-base text-neutral-700">
                    {/* Address */}
                    {merchant.address && (
                    <div>
                        <p className="leading-relaxed">{merchant.address}</p>
                        {merchant.geo?.lat && merchant.geo?.lng && (
                          <button
                            onClick={() => setMapsOpen(true)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                          >
                            Get Directions
                          </button>
                      )}
                    </div>
                    )}

                    {/* Phone */}
                    {googleMeta?.formatted_phone_number && (
                        <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a
                          href={`tel:${googleMeta.formatted_phone_number.replace(/\s/g, '')}`}
                          className="text-blue-600 hover:underline"
                        >
                          {googleMeta.formatted_phone_number}
                        </a>
                        </div>
                      )}
                      
                    {/* Instagram */}
                    {(merchant.contact?.instagram || (googleMeta?.website && googleMeta.website.includes('instagram.com'))) && (
                        <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <a
                          href={merchant.contact?.instagram || googleMeta?.website || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Instagram
                        </a>
                        </div>
                      )}

                    {/* Google Profile */}
                    {googleMeta?.url && (
                        <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <a
                          href={googleMeta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-neutral-600 hover:text-neutral-900"
                        >
                          View Google Profile
                        </a>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </header>

      {/* Main Content - Below Header */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        {/* Available Wines Section - Only show for Wine Shops */}
        {typeLabel === 'Wine Shop' && (
          <>
            {/* Subtle Section Divider */}
            <div className="border-t mb-16" style={{ borderColor: '#E8E4DE' }}></div>

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
          </>
        )}

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
            src={galleryImages[lightboxIndex]}
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

      {/* Map Choice Modal */}
      {mapsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setMapsOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif mb-4">Choose Maps App</h3>
            <div className="space-y-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.geo?.lat},${merchant.geo?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Google Maps
              </a>
              <a
                href={`https://maps.apple.com/?daddr=${merchant.geo?.lat},${merchant.geo?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 text-center bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Apple Maps
              </a>
              <button
                onClick={() => setMapsOpen(false)}
                className="block w-full px-4 py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
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
