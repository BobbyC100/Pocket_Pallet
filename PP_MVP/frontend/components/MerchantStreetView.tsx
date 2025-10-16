'use client';

import { useState } from 'react';

interface MerchantStreetViewProps {
  lat: number;
  lng: number;
  merchantName?: string;
}

export default function MerchantStreetView({ lat, lng, merchantName }: MerchantStreetViewProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Don't render if no API key or coordinates
  if (!apiKey || !lat || !lng) {
    return null;
  }
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${lat},${lng}&fov=90&key=${apiKey}`;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  if (imageError) {
    return null;
  }

  return (
    <section className="my-10 px-6 md:px-20">
      <h2 className="text-2xl font-semibold mb-4">Street View</h2>
      <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 bg-gray-100">
        {loading && (
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading street view...</div>
          </div>
        )}
        <img
          src={streetViewUrl}
          alt={`Street view of ${merchantName || 'location'}`}
          className={`w-full h-auto object-cover transition-opacity duration-700 ${
            loading ? 'opacity-0 absolute' : 'opacity-100'
          }`}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            console.warn('Street View image failed to load');
            setImageError(true);
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-neutral-500">
          View from the street — powered by Google Maps
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-wine-600 hover:text-wine-700 hover:underline font-medium"
        >
          Open in Google Maps →
        </a>
      </div>
    </section>
  );
}

