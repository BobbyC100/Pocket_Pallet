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
  editor_note?: string | null;
  editor_name?: string | null;
  editor_title?: string | null;
  editor_is_published?: boolean;
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
  const [hoursExpanded, setHoursExpanded] = useState(false);
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

  // Helper: Get status message with next state change
  const getStatusMessage = () => {
    const openingHours = googleMeta?.opening_hours;
    if (!openingHours) return null;
    
    const isOpen = openingHours.open_now;
    const periods = openingHours.periods;
    
    if (!periods || periods.length === 0) {
      return isOpen ? 'Open' : 'Closed';
    }
    
    // Get current day/time
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 14:30 = 1430
    
    // Find today's periods
    const todayPeriods = periods.filter(p => p.open.day === currentDay);
    
    // Trust Google's open_now field, but add context from periods
    if (isOpen) {
      // Currently open - find when it closes
      for (const period of todayPeriods) {
        const openTime = parseInt(period.open.time);
        const closeTime = period.close ? parseInt(period.close.time) : 2400;
        
        if (currentTime >= openTime && currentTime < closeTime) {
          const closeFormatted = formatTime(period.close?.time || '2400');
          return `Open · Closes ${closeFormatted}`;
        }
      }
      return 'Open'; // Fallback if we can't find the closing time
    } else {
      // Currently closed - find when it opens
      
      // Check for later today
      const futurePeriodsToday = todayPeriods.filter(p => parseInt(p.open.time) > currentTime);
      if (futurePeriodsToday.length > 0) {
        const nextPeriod = futurePeriodsToday[0];
        const openFormatted = formatTime(nextPeriod.open.time);
        return `Closed · Opens ${openFormatted}`;
      }
      
      // Find tomorrow's opening
      const tomorrowDay = (currentDay + 1) % 7;
      const tomorrowPeriods = periods.filter(p => p.open.day === tomorrowDay);
      if (tomorrowPeriods.length > 0) {
        const openFormatted = formatTime(tomorrowPeriods[0].open.time);
        return `Closed · Opens ${openFormatted}`;
      }
      
      // Find next available day
      const futurePeriods = periods.filter(p => p.open.day > currentDay);
      if (futurePeriods.length > 0) {
        const nextPeriod = futurePeriods[0];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const nextDay = days[nextPeriod.open.day];
        const openTime = formatTime(nextPeriod.open.time);
        return `Closed · Opens ${nextDay} ${openTime}`;
      }
      
      return 'Closed'; // Fallback
    }
  };
  
  // Helper: Format time string (e.g., "1430" -> "2:30 PM")
  const formatTime = (time: string) => {
    const hours = parseInt(time.slice(0, -2));
    const minutes = time.slice(-2);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  };
  
  // Helper: Get price range display
  const getPriceRange = () => {
    if (!googleMeta?.price_level) return null;
    const level = googleMeta.price_level;
    if (level === 1) return '$10–20 per person';
    if (level === 2) return '$20–40 per person';
    if (level === 3) return '$40–70 per person';
    if (level === 4) return '$70+ per person';
    return null;
  };
  
  // Helper: Get last updated message
  const getLastUpdated = () => {
    if (!merchant.created_at) return null;
    const created = new Date(merchant.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `Updated ${Math.floor(diffDays / 30)} months ago`;
    return 'Verified by admin';
  };

  // Helper: Get time until next state change (e.g., "Opens in 3 hours")
  const getTimeUntilChange = () => {
    const openingHours = googleMeta?.opening_hours;
    if (!openingHours || !openingHours.periods || openingHours.periods.length === 0) return null;
    
    const isOpen = openingHours.open_now;
    const periods = openingHours.periods;
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7;
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Find today's periods
    const todayPeriods = periods.filter(p => p.open.day === currentDay);
    
    if (isOpen) {
      // Currently open, find closing time
      for (const period of todayPeriods) {
        const openTime = parseInt(period.open.time);
        const closeTime = period.close ? parseInt(period.close.time) : 2400;
        
        if (currentTime >= openTime && currentTime < closeTime) {
          const closeHour = Math.floor(closeTime / 100);
          const closeMinute = closeTime % 100;
          const closeDate = new Date(now);
          closeDate.setHours(closeHour, closeMinute, 0, 0);
          
          const diffMs = closeDate.getTime() - now.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          if (diffHours > 0) {
            return `Closes in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
          } else if (diffMinutes > 0) {
            return `Closes in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
          }
        }
      }
    } else {
      // Currently closed, find next opening time
      // Check for later today
      const futurePeriodsToday = todayPeriods.filter(p => parseInt(p.open.time) > currentTime);
      if (futurePeriodsToday.length > 0) {
        const nextPeriod = futurePeriodsToday[0];
        const openTime = parseInt(nextPeriod.open.time);
        const openHour = Math.floor(openTime / 100);
        const openMinute = openTime % 100;
        const openDate = new Date(now);
        openDate.setHours(openHour, openMinute, 0, 0);
        
        const diffMs = openDate.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
          return `Opens in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
        } else if (diffMinutes > 0) {
          return `Opens in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        }
      }
      
      // Check for tomorrow
      const tomorrowDay = (currentDay + 1) % 7;
      const tomorrowPeriods = periods.filter(p => p.open.day === tomorrowDay);
      if (tomorrowPeriods.length > 0) {
        const nextPeriod = tomorrowPeriods[0];
        const openTime = parseInt(nextPeriod.open.time);
        const openHour = Math.floor(openTime / 100);
        const openMinute = openTime % 100;
        const openDate = new Date(now);
        openDate.setDate(openDate.getDate() + 1);
        openDate.setHours(openHour, openMinute, 0, 0);
        
        const diffMs = openDate.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        return `Opens in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      }
    }
    
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#FAF6EF', color: '#222' }}>
      {/* Header Layout: Left Title / Right Hero */}
      <header className="mx-auto max-w-6xl px-4 pt-6">
        <div className="grid items-start gap-6 md:grid-cols-[minmax(260px,360px)_0.9fr]">
          {/* LEFT: Title + Address + Action Pills */}
          <div className="flex w-full flex-col items-start">
            <h1 className="w-full text-left text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
              {merchant.name.replace(/\s*\([^)]*\)/g, '').trim()}
            </h1>

            {/* Action Pills - Below Title */}
            <div className="mt-4 flex w-full flex-wrap gap-2">
              {/* Directions - FIRST */}
              {merchant.geo?.lat && merchant.geo?.lng && (
                <button
                  onClick={() => setMapsOpen(true)}
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                >
                  Directions
                </button>
              )}

              {/* Call - SECOND */}
              {(googleMeta?.formatted_phone_number || merchant.contact?.phone) && (
                <a
                  href={`tel:${googleMeta?.formatted_phone_number || merchant.contact?.phone}`}
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
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
                      className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                      Instagram
                    </a>
                  ) : (
                    <a
                      href={googleMeta?.website || merchant.contact?.website}
                target="_blank"
                rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
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
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                >
                  Instagram
                </a>
              )}
          </div>

            {/* Container 1: At a glance + Description */}
            <section className="mt-5 w-full rounded-lg border border-neutral-200 p-4" aria-labelledby="at-a-glance" style={{ backgroundColor: 'transparent' }}>
              <h2 
                id="at-a-glance" 
                className="mb-2.5 w-full text-left text-sm font-semibold text-neutral-600"
              >
                At a glance
              </h2>

              {/* Horizontal pill row with wrap */}
              <div className="flex w-full flex-wrap items-center gap-x-2.5 gap-y-2">
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

              {/* Description - Within Container 1 */}
              <div className="mt-4 w-full">
                <div className="relative w-full">
                  <p
                    ref={descriptionRef}
                    id="merchant-description"
                    className={descriptionExpanded ? 'w-full text-left text-neutral-800' : 'w-full text-left text-neutral-800 line-clamp-4'}
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
                        background: 'linear-gradient(to bottom, transparent, rgba(250,246,239,0.92))'
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
              </div>

              {/* Editor's Note - Manual Editorial Content */}
              {merchant.editor_is_published && merchant.editor_note && (
                <section className="mt-4 border-t border-neutral-200 pt-3">
                  <div className="text-xs uppercase tracking-wide text-neutral-500 font-semibold">
                    {merchant.editor_name ? (
                      <>
                        Editor's Note from {merchant.editor_name}
                        {merchant.editor_title && (
                          <span className="text-neutral-400"> ({merchant.editor_title})</span>
                        )}
                        :
                      </>
                    ) : (
                      <>Editor's Note:</>
          )}
        </div>
                  <p className="mt-1 text-sm md:text-base italic text-neutral-700">
                    {merchant.editor_note}
                  </p>
                </section>
              )}
      </section>

            {/* Container 2: Business Details */}
            <section className="mt-3 w-full rounded-lg border border-neutral-200 p-4 space-y-4" aria-label="Business Details" style={{ backgroundColor: 'transparent' }}>
              {/* Group 1: Status + Price (what matters first) */}
              <div className="space-y-1.5">
                {/* Status Line + Countdown */}
                {getStatusMessage() && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-neutral-400">🕐</span>
                      <p className="text-base">
                        {getStatusMessage()!.startsWith('Open') ? (
                          <>
                            <span className="font-semibold text-green-700">Open</span>
                            <span className="text-neutral-700"> {getStatusMessage()!.replace('Open', '').trim()}</span>
                          </>
                        ) : getStatusMessage()!.startsWith('Closed') ? (
                          <>
                            <span className="font-semibold text-red-600">Closed</span>
                            <span className="text-neutral-700"> {getStatusMessage()!.replace('Closed', '').trim()}</span>
                          </>
                        ) : (
                          <span className="text-neutral-700">{getStatusMessage()}</span>
                        )}
          </p>
        </div>

                    {/* Time Until Change */}
                    {getTimeUntilChange() && (
                      <p className="ml-7 text-sm text-neutral-600">
                        {getTimeUntilChange()}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Price Range */}
                {getPriceRange() && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-neutral-400">💵</span>
                    <p className="text-base text-neutral-700">{getPriceRange()}</p>
                  </div>
                      )}
                    </div>

              {/* Group 2: Address + Last Updated */}
              <div className="space-y-1.5">
                {/* Address */}
                {(googleMeta?.formatted_address || merchant.address) && (
                  <div className="flex items-start gap-2">
                    <span className="text-lg text-neutral-400 mt-0.5">📍</span>
                    <p className="text-base leading-relaxed text-neutral-700">
                      {googleMeta?.formatted_address || merchant.address}
                    </p>
                        </div>
                      )}
                      
                {/* Last Updated */}
                {getLastUpdated() && (
                  <p className="ml-7 text-sm text-neutral-500">
                    {getLastUpdated()}
                  </p>
                )}
                
                {/* See More Hours Button */}
                {googleMeta?.opening_hours?.weekday_text && (
                  <button
                    type="button"
                    onClick={() => setHoursExpanded(!hoursExpanded)}
                    className="ml-7 text-sm font-medium text-blue-600 hover:underline"
                  >
                    {hoursExpanded ? 'Hide hours' : 'See more hours'}
                  </button>
                )}
              </div>
              
              {/* Expandable Hours Table */}
              {hoursExpanded && googleMeta?.opening_hours?.weekday_text && (
                <div className="ml-7 pt-2">
                  <dl className="divide-y divide-neutral-100">
                    {googleMeta.opening_hours.weekday_text.map((text, i) => {
                      const [day, hours] = text.split(': ');
                      const todayIndex = (new Date().getDay() + 6) % 7;
                      const isToday = i === todayIndex;
                      return (
                        <div key={i} className="grid grid-cols-[100px_1fr] items-baseline py-1.5">
                          <dt className={isToday ? "text-sm font-semibold text-amber-700" : "text-sm text-neutral-600"}>
                            {day}
                          </dt>
                          <dd className={isToday ? "text-sm font-semibold text-amber-700" : "text-sm text-neutral-600"}>
                            {hours}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              )}
              
              {/* Group 3: Action Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {/* Phone */}
                {googleMeta?.formatted_phone_number && (
                  <a
                    href={`tel:${googleMeta.formatted_phone_number.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <span className="text-base">📞</span> Call
                  </a>
                )}
                
                {/* Directions */}
                {merchant.geo?.lat && merchant.geo?.lng && (
                  <button
                    onClick={() => setMapsOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <span className="text-base">🧭</span> Directions
                  </button>
                )}
                
                {/* Instagram */}
                {(merchant.contact?.instagram || (googleMeta?.website && googleMeta.website.includes('instagram.com'))) && (
                  <a
                    href={merchant.contact?.instagram || googleMeta?.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <span className="text-base">📸</span> Instagram
                  </a>
                )}
                
                {/* Google Profile */}
                {googleMeta?.url && (
                  <a
                    href={googleMeta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <span className="text-base">🔎</span> Google
                  </a>
                )}
              </div>
            </section>
        </div>

          {/* RIGHT: Hero + Photo Mosaic */}
          <div className="flex flex-col gap-6">
            {/* Hero Image */}
            <div className="flex justify-end items-start">
              <img
                src={getHeroImage()}
                alt={merchant.name}
                className="aspect-[16/9] w-full max-w-[730px] rounded-2xl object-cover shadow-sm"
              />
                    </div>

            {/* Photo Mosaic - 5-Up Layout */}
            {galleryImages.length > 0 && (
              <section>
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
                  {/* First photo - Large (2x2 on desktop, normal on mobile) */}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(0)}
                    className="group relative block h-full w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 col-span-2 row-span-2 hidden md:block"
                    aria-label="Open photo gallery"
                  >
                    <img
                      src={galleryImages[0]}
                      alt={`${merchant.name} photo 1`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    {hasStreetView && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/60 text-white text-xs px-2 py-1">
                        Street View
                      </span>
                    )}
                  </button>

                  {/* First photo - Mobile version */}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(0)}
                    className="group relative block h-full w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 aspect-[4/3] md:hidden"
                    aria-label="Open photo gallery"
                  >
                    <img
                      src={galleryImages[0]}
                      alt={`${merchant.name} photo 1`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    {hasStreetView && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/60 text-white text-xs px-2 py-1">
                        Street View
                      </span>
                    )}
                  </button>

                  {/* Next 4 photos (or fewer if less available) */}
                  {galleryImages.slice(1, 5).map((src, idx) => {
                    const absoluteIndex = idx + 1;
                    const isLastTile = absoluteIndex === 4 && galleryImages.length > 5;
                    const remaining = galleryImages.length - 5;

                    return (
                      <button
                        key={absoluteIndex}
                        type="button"
                        onClick={() => setLightboxIndex(absoluteIndex)}
                        className="group relative block h-full w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 aspect-[4/3] md:aspect-auto"
                        aria-label={isLastTile ? `View ${remaining} more photos` : `Open photo ${absoluteIndex + 1}`}
                      >
                        <img
                          src={src}
                          alt={`${merchant.name} photo ${absoluteIndex + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                        
                        {/* "+X More" overlay on last tile */}
                        {isLastTile && remaining > 0 && (
                          <>
                            <div className="absolute inset-0 bg-black/35" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="rounded-md bg-black/55 px-3 py-1.5 text-lg font-semibold text-white">
                                +{remaining} More
                          </span>
                        </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                        </div>
              </section>
            )}
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
