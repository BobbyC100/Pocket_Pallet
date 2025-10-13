'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../services/api';
import WineCard from '../components/WineCard';

type Wine = {
  id: number;
  name: string;
  region?: string | null;
  vintage?: string | null;
  price_usd?: number | null;
  notes?: string | null;
  status?: string | null;
  rating?: number | null;
};

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loadingWines, setLoadingWines] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMyWines();
    }
  }, [user]);

  const fetchMyWines = async () => {
    setLoadingWines(true);
    try {
      const response = await api.get('/api/v1/wines/my?limit=20');
      setWines(response.data);
    } catch (error) {
      console.error('Failed to fetch wines:', error);
      //  If endpoint fails, fallback to empty
      setWines([]);
    } finally {
      setLoadingWines(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wine-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wine-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Pocket Pallet
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.username || user.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="text-sm text-wine-600 hover:text-wine-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
            My Wines
          </h2>
          <p className="text-gray-700">
            Everything you've added via import or OCR lives here. Add tasting notes to teach Pocket Pallet your palate.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/imports/new')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-wine-300 hover:shadow-sm transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-wine-100 flex items-center justify-center mb-4 group-hover:bg-wine-200 transition-colors">
              <svg className="w-6 h-6 text-wine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Wines</h3>
            <p className="text-sm text-gray-700">Upload CSV</p>
          </button>

          <button
            onClick={() => router.push('/ocr')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-wine-300 hover:shadow-sm transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-wine-100 flex items-center justify-center mb-4 group-hover:bg-wine-200 transition-colors">
              <svg className="w-6 h-6 text-wine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Wine List</h3>
            <p className="text-sm text-gray-700">OCR extract</p>
          </button>

          <button
            onClick={() => router.push('/wines')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-wine-300 hover:shadow-sm transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-wine-100 flex items-center justify-center mb-4 group-hover:bg-wine-200 transition-colors">
              <svg className="w-6 h-6 text-wine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse All</h3>
            <p className="text-sm text-gray-700">View full collection</p>
          </button>
        </div>

        {/* My Wines Grid */}
        {loadingWines ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-wine-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : wines.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <p className="text-gray-800">No wines yet.</p>
            <p className="text-gray-700 mt-1">Try uploading via CSV or OCR—new wines will show up here automatically.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Added ({wines.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {wines.map((wine) => (
                <WineCard key={wine.id} wine={wine} onSaved={fetchMyWines} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
