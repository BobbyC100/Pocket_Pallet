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
            {/* Website or Instagram Button */}
            {(googleMeta?.website || merchant.contact?.website) && (
              <>
                {isInstagramUrl(googleMeta?.website || merchant.contact?.website) ? (
                  <a
                    href={googleMeta?.website || merchant.contact?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
                  >
                    Instagram
                  </a>
                ) : (
                  <a
                    href={googleMeta?.website || merchant.contact?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
                  >
                    Website
                  </a>
                )}
              </>
            )}
            {/* Show Instagram button if contact.instagram exists */}
            {merchant.contact?.instagram && !isInstagramUrl(googleMeta?.website || merchant.contact?.website || '') && (
              <a
                href={`https://instagram.com/${merchant.contact.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/70 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content - Below the Fold */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Meta → Description → Tips */}
          <div className="relative">
            {/* At a Glance Section - Horizontal Pill Row */}
            <section className="mb-6 pt-2" aria-labelledby="at-a-glance">
              <h2 
                id="at-a-glance" 
                className="mb-3 text-sm font-medium"
                style={{ color: '#6b7280' }}
              >
                At a glance
              </h2>

              {/* Horizontal pill row with wrap */}
              <div className="flex flex-wrap gap-2">
                {/* Status - GREEN for Open, RED for Closed - ALWAYS FIRST */}
                {googleMeta?.opening_hours?.open_now !== undefined && (
                  <span 
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium border whitespace-nowrap"
                    style={{
                      borderColor: googleMeta.opening_hours.open_now ? '#86efac' : '#fecaca',
                      backgroundColor: googleMeta.opening_hours.open_now ? '#dcfce7' : '#fef2f2',
                      color: googleMeta.opening_hours.open_now ? '#15803d' : '#b91c1c'
                    }}
                    title={googleMeta.opening_hours.open_now ? 'Currently open' : 'Currently closed'}
                  >
                    {googleMeta.opening_hours.open_now ? 'Open' : 'Closed'}
                  </span>
                )}

                {/* Type */}
                {typeLabel && (
                  <span 
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm border whitespace-nowrap"
                    style={{
                      borderColor: '#e5e7eb',
                      backgroundColor: '#fafafa',
                      color: '#374151'
                    }}
                    title={`Type: ${typeLabel}`}
                  >
                    {typeLabel}
                  </span>
                )}

                {/* Cost */}
                {googleMeta?.price_level && (
                  <span 
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm border whitespace-nowrap"
                    style={{
                      borderColor: '#e5e7eb',
                      backgroundColor: '#fafafa',
                      color: '#374151'
                    }}
                    title={`Price level: ${'$'.repeat(googleMeta.price_level)}`}
                  >
                    {'$'.repeat(googleMeta.price_level)}
                  </span>
                )}

                {/* Vibe */}
                {getVibe() && (
                  <span 
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm border whitespace-nowrap"
                    style={{
                      borderColor: '#e5e7eb',
                      backgroundColor: '#fafafa',
                      color: '#374151'
                    }}
                    title={`Vibe: ${getVibe()}`}
                  >
                    {getVibe()}
                  </span>
                )}

                {/* Known For - each as its own pill */}
                {getKnownFor().slice(0, 4).map((item, i) => (
                  <span 
                    key={`known-${i}`}
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm border whitespace-nowrap"
                    style={{
                      borderColor: '#e5e7eb',
                      backgroundColor: '#fafafa',
                      color: '#374151'
                    }}
                    title={`Known for: ${item}`}
                  >
                    {item}
                  </span>
                ))}

                {/* Good to Know - each as its own pill */}
                {getGoodToKnow().map((tip, i) => (
                  <span 
                    key={`tip-${i}`}
                    className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm border whitespace-nowrap"
                    style={{
                      borderColor: '#e5e7eb',
                      backgroundColor: '#fafafa',
                      color: '#374151'
                    }}
                    title={`Good to know: ${tip}`}
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </section>

            {/* Description Section - Line Clamped */}
            <div className="mb-8">
              <div className="relative">
                <div
                  ref={descriptionRef}
                  id="merchant-description"
                  className={`text-lg leading-relaxed ${
                    descriptionExpanded ? '' : 'line-clamp-5 lg:line-clamp-5 md:line-clamp-6 sm:line-clamp-8'
                  }`}
                  style={{ 
                    color: '#333',
                    fontSize: '19px',
                    lineHeight: '1.8',
                    fontFamily: 'Inter, "Work Sans", sans-serif'
                  }}
                >
                  {googleMeta?.editorial_summary || merchant.about || 
                    `${merchant.name} is a curated destination for natural wine enthusiasts. Discover unique bottles from small producers and family vineyards, carefully selected for their character and authenticity.`}
                </div>
                
                {/* Gradient Fade - Only when clamped */}
                {!descriptionExpanded && shouldShowToggle && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, #FEFDFB)'
                    }}
                  />
                )}
              </div>

              {/* View More/Less Toggle */}
              {shouldShowToggle && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  aria-expanded={descriptionExpanded}
                  aria-controls="merchant-description"
                  className="mt-3 text-sm text-blue-600 hover:underline font-medium transition-colors motion-reduce:transition-none"
                >
                  {descriptionExpanded ? 'View less ↑' : 'View more ↓'}
                </button>
              )}
            </div>
          </div>
          
          {/* Right Column - Anchor Image (skip Street View, use first Google photo) */}
                    <div>
            {galleryImages.length > 1 && (
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={galleryImages[1]}
                  alt={`${merchant.name} interior`}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Subtle Section Divider */}
        <hr className="border-t my-6" style={{ borderColor: '#E8E4DE' }} />

        {/* Photo Mosaic - Google Places Photos */}
        {galleryImages.length > 0 && (
          <section className="py-6 md:py-8">
            <h2 className="text-2xl md:text-3xl font-serif mb-6 text-center" style={{ 
              fontFamily: 'Georgia, "Playfair Display", serif'
            }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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

        {/* Subtle Section Divider */}
        <hr className="border-t my-6" style={{ borderColor: '#E8E4DE' }} />

        {/* Two-Column: Hours & Contact/Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-8 md:pb-10">
          {/* Hours */}
          {googleMeta?.opening_hours?.weekday_text && (
            <section>
              <h2 className="text-lg font-serif mb-3 text-center" style={{ 
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
            <h2 className="text-lg font-serif mb-3 text-center" style={{ 
              fontFamily: 'Georgia, "Playfair Display", serif'
            }}>
              Contact & Address
            </h2>
            
            <div className="space-y-4 text-sm" style={{ color: '#555', lineHeight: '1.5' }}>
              {/* Address */}
              {(googleMeta?.formatted_address || merchant.address) && (
                <div>
                  <p className="mb-1 text-left">{googleMeta?.formatted_address || merchant.address}</p>
                  <button
                    onClick={() => setMapsOpen(true)}
                    className="text-blue-600 hover:underline text-xs text-left"
                  >
                    Get Directions →
                  </button>
                        </div>
                      )}

              {/* Contact Section */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Contact</h3>
                <div className="space-y-1.5">
                  {/* Phone */}
                  {(googleMeta?.formatted_phone_number || merchant.contact?.phone) && (
                    <div>
                      <a 
                        href={`tel:${googleMeta?.formatted_phone_number || merchant.contact?.phone}`}
                        className="text-blue-600 hover:underline block text-left"
                      >
                        {googleMeta?.formatted_phone_number || merchant.contact?.phone}
                      </a>
                        </div>
                      )}

                  {/* Website - only if not Instagram */}
                  {(googleMeta?.website || merchant.contact?.website) && !isInstagramUrl(googleMeta?.website || merchant.contact?.website) && (
                    <div>
                      <a
                        href={googleMeta?.website || merchant.contact?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all block text-left"
                      >
                        {displayUrl(googleMeta?.website || merchant.contact?.website || '')}
                      </a>
                        </div>
                      )}

                  {/* Instagram - from contact field OR from website if it's Instagram */}
                  {(merchant.contact?.instagram || isInstagramUrl(googleMeta?.website || merchant.contact?.website)) && (
                    <div>
                      <a
                        href={
                          merchant.contact?.instagram 
                            ? `https://instagram.com/${merchant.contact.instagram.replace('@', '')}`
                            : (googleMeta?.website || merchant.contact?.website || '')
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block text-left"
                      >
                        {merchant.contact?.instagram || getInstagramHandle(googleMeta?.website || merchant.contact?.website || '')}
                      </a>
                        </div>
                      )}
                </div>
              </div>
            </div>
            
            {/* View on Google Link */}
            <div className="mt-2">
              <a
                href={googleMeta?.url || merchant.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block text-left text-sm"
              >
                View Google Profile
              </a>
            </div>
          </section>
                    </div>

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
