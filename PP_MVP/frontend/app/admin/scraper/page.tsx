'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/app/services/api';

type Source = {
  id: number;
  name: string;
  base_url: string;
  enabled: boolean;
  last_run_at: string | null;
};

type ScrapedWine = {
  id: number;
  producer: string | null;
  cuvee: string | null;
  vintage: string | null;
  region: string | null;
  volume_ml: number | null;
  created_at: string;
};

type Product = {
  id: number;
  product_url: string;
  title_raw: string | null;
  source_id: number;
  created_at: string;
};

export default function AdminScraperPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'sources' | 'wines' | 'products' | 'stats'>('stats');
  const [sources, setSources] = useState<Source[]>([]);
  const [wines, setWines] = useState<ScrapedWine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    base_url: '',
    product_link_selector: '',
    pagination_next_selector: '',
    use_playwright: false,
    enabled: true
  });

  // Check auth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load initial stats
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sourcesRes, winesRes, productsRes] = await Promise.all([
        api.get('/api/v1/scraper/sources?limit=10'),
        api.get('/api/v1/scraper/wines?limit=10'),
        api.get('/api/v1/scraper/products?limit=10')
      ]);
      
      setStats({
        total_sources: sourcesRes.data.length,
        total_wines: winesRes.data.length,
        total_products: productsRes.data.length
      });
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err?.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/scraper/sources?limit=50');
      setSources(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const loadWines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/scraper/wines?limit=50');
      setWines(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load wines');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/scraper/products?limit=50');
      setProducts(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'sources' && sources.length === 0) loadSources();
    if (tab === 'wines' && wines.length === 0) loadWines();
    if (tab === 'products' && products.length === 0) loadProducts();
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      await api.post('/api/v1/scraper/sources', formData);
      
      // Reset form
      setFormData({
        name: '',
        base_url: '',
        product_link_selector: '',
        pagination_next_selector: '',
        use_playwright: false,
        enabled: true
      });
      setShowCreateForm(false);
      
      // Reload sources
      await loadSources();
      setActiveTab('sources');
    } catch (err: any) {
      console.error('Failed to create source:', err);
      setError(err?.response?.data?.detail || 'Failed to create source');
    } finally {
      setCreateLoading(false);
    }
  };

  if (authLoading) {
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Scraper Admin</h1>
              <p className="mt-1 text-sm text-gray-700">View scraped wines, products, and sources</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { key: 'stats', label: 'Overview' },
              { key: 'sources', label: 'Sources' },
              { key: 'wines', label: 'Scraped Wines' },
              { key: 'products', label: 'Products' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-wine-600 text-wine-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-gray-900">
                  {stats?.total_sources || 0}
                </div>
                <p className="text-sm text-gray-700 mt-1">Retailer websites</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => handleTabChange('sources')}
                >
                  View Sources
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scraped Wines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-gray-900">
                  {stats?.total_wines || 0}
                </div>
                <p className="text-sm text-gray-700 mt-1">Wines in catalog</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => handleTabChange('wines')}
                >
                  View Wines
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-gray-900">
                  {stats?.total_products || 0}
                </div>
                <p className="text-sm text-gray-700 mt-1">Product listings</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => handleTabChange('products')}
                >
                  View Products
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scraper Sources</CardTitle>
                <Button onClick={() => setShowCreateForm(true)}>
                  + Create Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-700">Loading sources...</div>
              ) : sources.length === 0 ? (
                <div className="text-center py-8 text-gray-700">No sources configured yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">URL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Run</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sources.map((source) => (
                        <tr key={source.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{source.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{source.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                            <a href={source.base_url} target="_blank" rel="noopener noreferrer" className="text-wine-600 hover:underline">
                              {source.base_url}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              source.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {source.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {source.last_run_at 
                              ? new Date(source.last_run_at).toLocaleString()
                              : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Wines Tab */}
        {activeTab === 'wines' && (
          <Card>
            <CardHeader>
              <CardTitle>Scraped Wines (Last 50)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-700">Loading wines...</div>
              ) : wines.length === 0 ? (
                <div className="text-center py-8 text-gray-700">No wines scraped yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Producer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cuvee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Vintage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Region</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Size</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wines.map((wine) => (
                        <tr key={wine.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{wine.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{wine.producer || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{wine.cuvee || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{wine.vintage || 'NV'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{wine.region || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {wine.volume_ml ? `${wine.volume_ml}ml` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <Card>
            <CardHeader>
              <CardTitle>Products (Last 50)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-700">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-700">No products scraped yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">URL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                            {product.title_raw || 'Untitled'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                            <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-wine-600 hover:underline">
                              {product.product_url}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">#{product.source_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Source Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Scraper Source</h2>
            </div>
            
            <form onSubmit={handleCreateSource} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Wine.com Red Wines"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wine-600"
                />
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Base URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="https://example.com/wines"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wine-600"
                />
              </div>

              {/* Product Link Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product Link Selector (CSS)
                </label>
                <input
                  type="text"
                  value={formData.product_link_selector}
                  onChange={(e) => setFormData({ ...formData, product_link_selector: e.target.value })}
                  placeholder="e.g., .product-card a.product-link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wine-600"
                />
                <p className="mt-1 text-xs text-gray-700">CSS selector to find product links on the page</p>
              </div>

              {/* Pagination Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pagination Next Selector (CSS)
                </label>
                <input
                  type="text"
                  value={formData.pagination_next_selector}
                  onChange={(e) => setFormData({ ...formData, pagination_next_selector: e.target.value })}
                  placeholder="e.g., a.next-page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wine-600"
                />
                <p className="mt-1 text-xs text-gray-700">CSS selector for the "Next Page" button</p>
              </div>

              {/* Use Playwright */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use_playwright"
                  checked={formData.use_playwright}
                  onChange={(e) => setFormData({ ...formData, use_playwright: e.target.checked })}
                  className="h-4 w-4 text-wine-600 border-gray-300 rounded focus:ring-wine-600"
                />
                <label htmlFor="use_playwright" className="ml-2 text-sm text-gray-900">
                  Use Playwright (for JavaScript-rendered content)
                </label>
              </div>

              {/* Enabled */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-wine-600 border-gray-300 rounded focus:ring-wine-600"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-900">
                  Enabled
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={createLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1"
                >
                  {createLoading ? 'Creating...' : 'Create Source'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

