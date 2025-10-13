'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api';

interface OcrItem {
  raw: string;
  confidence: number;
  name: string | null;
  vintage: string | null;
  price_usd: number | null;
  bottle_size: string | null;
  status: string;
}

interface EditedItem extends OcrItem {
  id: string;
  editing: boolean;
  editedName?: string;
  editedVintage?: string;
  editedPrice?: string;
}

export default function OcrReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<EditedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/v1/ocr/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Note: In a real implementation, you'd store OCR results in sessionStorage
  // or backend and retrieve them here. For now, this is a placeholder.
  useEffect(() => {
    // Try to get OCR results from sessionStorage
    const storedResults = sessionStorage.getItem('ocr_results');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        const itemsWithIds = parsed.items.map((item: OcrItem, idx: number) => ({
          ...item,
          id: `item-${idx}`,
          editing: false,
          editedName: item.name || '',
          editedVintage: item.vintage || '',
          editedPrice: item.price_usd?.toString() || '',
        }));
        setItems(itemsWithIds);
      } catch (error) {
        console.error('Failed to parse OCR results:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleAccept = async (item: EditedItem) => {
    setSubmitting(item.id);
    try {
      await api.post('/api/v1/ocr/feedback', {
        raw_text: item.raw,
        confidence: item.confidence,
        parsed_name: item.name,
        parsed_vintage: item.vintage,
        parsed_price: item.price_usd?.toString(),
        action: 'accept',
      });
      
      // Remove item from review list
      setItems(items.filter(i => i.id !== item.id));
      await loadStats();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const handleEdit = (item: EditedItem) => {
    setItems(items.map(i => 
      i.id === item.id ? { ...i, editing: true } : i
    ));
  };

  const handleSaveEdit = async (item: EditedItem) => {
    setSubmitting(item.id);
    try {
      await api.post('/api/v1/ocr/feedback', {
        raw_text: item.raw,
        confidence: item.confidence,
        parsed_name: item.name,
        parsed_vintage: item.vintage,
        parsed_price: item.price_usd?.toString(),
        action: 'edit',
        corrected_name: item.editedName,
        corrected_vintage: item.editedVintage,
        corrected_price: item.editedPrice,
      });
      
      // Remove item from review list
      setItems(items.filter(i => i.id !== item.id));
      await loadStats();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async (item: EditedItem) => {
    setSubmitting(item.id);
    try {
      await api.post('/api/v1/ocr/feedback', {
        raw_text: item.raw,
        confidence: item.confidence,
        parsed_name: item.name,
        parsed_vintage: item.vintage,
        parsed_price: item.price_usd?.toString(),
        action: 'reject',
      });
      
      // Remove item from review list
      setItems(items.filter(i => i.id !== item.id));
      await loadStats();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const updateField = (id: string, field: keyof EditedItem, value: string) => {
    setItems(items.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wine-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-wine-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading review items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wine-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
            OCR Review Queue
          </h1>
          <p className="text-gray-700">
            Review and correct OCR-extracted wine entries to improve future accuracy.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Feedback Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-semibold text-green-600">{stats.accepted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Edited</p>
                <p className="text-2xl font-semibold text-amber-600">{stats.edited}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-semibold text-wine-600">{stats.accuracy}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Review Items */}
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No items to review</p>
            <button
              onClick={() => router.push('/ocr')}
              className="text-wine-600 hover:text-wine-700 font-medium"
            >
              Upload a new wine list →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Confidence Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    item.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                    item.confidence >= 0.6 ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.status === 'ok' ? '✓ Ready' : '⚠ Needs Review'}
                  </span>
                </div>

                {/* Raw Text */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Raw OCR Text:</p>
                  <p className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
                    {item.raw}
                  </p>
                </div>

                {/* Parsed Fields */}
                {item.editing ? (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wine Name
                      </label>
                      <input
                        type="text"
                        value={item.editedName}
                        onChange={(e) => updateField(item.id, 'editedName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vintage
                        </label>
                        <input
                          type="text"
                          value={item.editedVintage}
                          onChange={(e) => updateField(item.id, 'editedVintage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (USD)
                        </label>
                        <input
                          type="text"
                          value={item.editedPrice}
                          onChange={(e) => updateField(item.id, 'editedPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Name: </span>
                      <span className="text-gray-900">{item.name || '(empty)'}</span>
                    </div>
                    {item.vintage && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Vintage: </span>
                        <span className="text-gray-900">{item.vintage}</span>
                      </div>
                    )}
                    {item.price_usd && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Price: </span>
                        <span className="text-gray-900">${item.price_usd}</span>
                      </div>
                    )}
                    {item.bottle_size && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Size: </span>
                        <span className="text-gray-900">{item.bottle_size}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {item.editing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(item)}
                        disabled={submitting === item.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {submitting === item.id ? 'Saving...' : 'Save Corrections'}
                      </button>
                      <button
                        onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, editing: false } : i))}
                        disabled={submitting === item.id}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAccept(item)}
                        disabled={submitting === item.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {submitting === item.id ? '...' : '✓ Accept'}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        disabled={submitting === item.id}
                        className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        disabled={submitting === item.id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

