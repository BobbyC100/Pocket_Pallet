import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { wineApi } from '@/services/api';
import { WineWithRelations } from '@/types';

export const WineList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data: wines, isLoading } = useQuery({
    queryKey: ['wines', debouncedQuery],
    queryFn: () => wineApi.search(debouncedQuery || 'a'),
    enabled: debouncedQuery.length >= 1,
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Wines</h1>
        <Link to="/wines/new" className="btn-primary px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          New Wine
        </Link>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search wines by producer, cuvée, or vintage..."
          className="input pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Results */}
      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Searching...
          </div>
        ) : wines && wines.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {wines.map((wine: WineWithRelations) => (
              <Link
                key={wine.id}
                to={`/wines/${wine.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {wine.producer_name}
                      {wine.cuvee && ` - ${wine.cuvee}`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {wine.is_nv ? 'NV' : wine.vintage} • {wine.wine_type || 'Wine'}
                      {wine.abv && ` • ${wine.abv}% ABV`}
                    </p>
                    {wine.region_name && (
                      <p className="text-sm text-gray-500 mt-1">
                        {wine.region_name}, {wine.country_name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    ID: {wine.id}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : debouncedQuery ? (
          <div className="p-8 text-center text-gray-500">
            No wines found. Try a different search.
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Enter a search query to find wines.
          </div>
        )}
      </div>
    </div>
  );
};

