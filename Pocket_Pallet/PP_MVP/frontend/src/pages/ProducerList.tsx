// Producer list page
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Plus, Users } from 'lucide-react';
import { producerApi } from '@/services/producerApi';
import type { ProducerCard } from '@/types/producerCard';

export const ProducerList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');
  
  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data: producers, isLoading } = useQuery({
    queryKey: ['producers', debouncedQuery, classFilter],
    queryFn: () => 
      debouncedQuery 
        ? producerApi.search(debouncedQuery) 
        : producerApi.list(100, 0, classFilter || undefined),
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Producers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage producer profiles and ethos data
          </p>
        </div>
        <Link to="/producers/new" className="btn-primary px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          New Producer
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search producers..."
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="input w-64"
        >
          <option value="">All Classes</option>
          <option value="Grower-Producer">Grower-Producer</option>
          <option value="Independent">Independent</option>
          <option value="Cooperative">Cooperative</option>
          <option value="Negociant">Negociant</option>
          <option value="Industrial">Industrial</option>
        </select>
      </div>
      
      {/* Results */}
      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading producers...
          </div>
        ) : producers && producers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {producers.map((producer: ProducerCard) => (
              <Link
                key={producer.id}
                to={`/producers/${producer.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {producer.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {producer.class}
                      </span>
                    </div>
                    
                    {producer.flags && producer.flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {producer.flags.map((flag) => (
                          <span
                            key={flag}
                            className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-xs text-green-700"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {producer.summary && (
                      <p className="mt-2 text-sm text-gray-600">{producer.summary}</p>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">ID: {producer.id}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No producers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

