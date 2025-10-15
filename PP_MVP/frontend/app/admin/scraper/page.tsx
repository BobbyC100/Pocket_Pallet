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
  product_link_selector: string | null;
  pagination_next_selector: string | null;
  use_playwright: boolean;
};

type ScrapeJob = {
  job_id: string;
  source_id: number;
  status: string;
  products_found: number;
  wines_created: number;
  snapshots_created: number;
  error: string | null;
  started_at: string;
  completed_at: string | null;
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
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    base_url: '',
    product_link_selector: '',
    pagination_next_selector: '',
    use_playwright: false,
    enabled: true
  });
  const [aiDetecting, setAiDetecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Map<number, ScrapeJob>>(new Map());
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
      if (editingSource) {
        // Update existing source
        await api.patch(`/api/v1/scraper/sources/${editingSource.id}`, formData);
      } else {
        // Create new source
        await api.post('/api/v1/scraper/sources', formData);
      }
      
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
      setEditingSource(null);
      
      // Reload sources
      await loadSources();
      setActiveTab('sources');
    } catch (err: any) {
      console.error('Failed to save source:', err);
      setError(err?.response?.data?.detail || 'Failed to save source');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSource = (source: Source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      base_url: source.base_url,
      product_link_selector: source.product_link_selector || '',
      pagination_next_selector: source.pagination_next_selector || '',
      use_playwright: source.use_playwright,
      enabled: source.enabled
    });
    setModalError(null);
    setTestResults(null);
    setShowCreateForm(true);
  };

  const handleAiDetect = async () => {
    if (!formData.base_url) {
      setModalError('Please enter a URL first');
      return;
    }

    setAiDetecting(true);
    setModalError(null);
    setTestResults(null);

    try {
      const res = await api.post('/api/v1/scraper/detect-selectors', {
        url: formData.base_url
      });
      
      const detected = res.data;
      
      // Update form with detected selectors
      setFormData({
        ...formData,
        name: formData.name || detected.suggested_name || '',
        product_link_selector: detected.product_link_selector || '',
        pagination_next_selector: detected.pagination_next_selector || '',
        use_playwright: detected.requires_playwright || false
      });

      // Show success message
      if (detected.confidence === 'high') {
        setModalError(null);
      } else {
        setModalError(`✓ Detected selectors (${detected.confidence} confidence). Test before saving.`);
      }
    } catch (err: any) {
      console.error('AI detection failed:', err);
      setModalError(err?.response?.data?.detail || 'Failed to detect selectors. Please enter them manually.');
    } finally {
      setAiDetecting(false);
    }
  };

  const handleTestSelectors = async () => {
    if (!formData.base_url || !formData.product_link_selector) {
      setModalError('Please enter URL and Product Link Selector first');
      return;
    }

    setTesting(true);
    setModalError(null);
    setTestResults(null);

    try {
      const res = await api.post('/api/v1/scraper/test-selectors', {
        url: formData.base_url,
        product_link_selector: formData.product_link_selector,
        pagination_next_selector: formData.pagination_next_selector
      });
      
      setTestResults(res.data);
      
      if (res.data.success && res.data.products_found > 0) {
        setModalError(`✅ Success! Found ${res.data.products_found} products. Ready to scrape.`);
      } else if (res.data.success && res.data.products_found === 0) {
        setModalError(`⚠️ Found 0 products. Selectors are likely incorrect. Check the examples below.`);
      } else {
        setModalError(`❌ Test failed: ${res.data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Test failed:', err);
      setModalError(err?.response?.data?.detail || 'Failed to test selectors.');
    } finally {
      setTesting(false);
    }
  };

  const handleRunScrape = async (sourceId: number) => {
    setActionLoading(sourceId);
    setError(null);

    try {
      const res = await api.post('/api/v1/scraper/scrape', {
        source_id: sourceId,
        max_pages: 5
      });
      
      const job = res.data as ScrapeJob;
      setActiveJobs(prev => new Map(prev).set(sourceId, job));
      
      // Poll job status
      pollJobStatus(job.job_id, sourceId);
    } catch (err: any) {
      console.error('Failed to start scrape:', err);
      setError(err?.response?.data?.detail || 'Failed to start scrape job');
    } finally {
      setActionLoading(null);
    }
  };

  const pollJobStatus = async (jobId: string, sourceId: number) => {
    const maxAttempts = 60; // Poll for up to 5 minutes
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await api.get(`/api/v1/scraper/jobs/${jobId}`);
        const job = res.data as ScrapeJob;
        
        setActiveJobs(prev => new Map(prev).set(sourceId, job));
        
        if (job.status === 'completed' || job.status === 'failed') {
          // Reload sources to update last_run_at
          loadSources();
          return;
        }
        
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
      }
    };

    poll();
  };

  const handleToggleEnabled = async (sourceId: number, currentEnabled: boolean) => {
    setActionLoading(sourceId);
    setError(null);

    try {
      await api.patch(`/api/v1/scraper/sources/${sourceId}`, {
        enabled: !currentEnabled
      });
      
      // Reload sources
      await loadSources();
    } catch (err: any) {
      console.error('Failed to toggle source:', err);
      setError(err?.response?.data?.detail || 'Failed to update source');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSource = async (sourceId: number, sourceName: string) => {
    if (!confirm(`Are you sure you want to delete "${sourceName}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(sourceId);
    setError(null);

    try {
      await api.delete(`/api/v1/scraper/sources/${sourceId}`);
      
      // Reload sources
      await loadSources();
    } catch (err: any) {
      console.error('Failed to delete source:', err);
      setError(err?.response?.data?.detail || 'Failed to delete source');
    } finally {
      setActionLoading(null);
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
                <div className="text-center py-8 text-gray-700">
                  <p className="mb-4">No sources configured yet.</p>
                  <Button onClick={() => setShowCreateForm(true)}>Create Your First Source</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">URL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Run</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Job Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sources.map((source) => {
                        const job = activeJobs.get(source.id);
                        const isLoading = actionLoading === source.id;
                        
                        return (
                          <tr key={source.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="font-medium">{source.name}</div>
                              <div className="text-xs text-gray-700">ID: {source.id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                              <a href={source.base_url} target="_blank" rel="noopener noreferrer" className="text-wine-600 hover:underline">
                                {source.base_url}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => handleToggleEnabled(source.id, source.enabled)}
                                disabled={isLoading}
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                                  source.enabled
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {source.enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {source.last_run_at 
                                ? new Date(source.last_run_at).toLocaleString()
                                : 'Never'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {job ? (
                                <div className="space-y-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {job.status}
                                  </span>
                                  {job.status === 'completed' && (
                                    <div className="text-xs text-gray-700">
                                      {job.wines_created} wines, {job.products_found} products
                                    </div>
                                  )}
                                  {job.error && (
                                    <div className="text-xs text-red-600 truncate max-w-xs">
                                      {job.error}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleRunScrape(source.id)}
                                disabled={!source.enabled || isLoading}
                                className="mr-2"
                              >
                                {isLoading ? 'Starting...' : '▶ Run'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSource(source)}
                                disabled={isLoading}
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSource(source.id, source.name)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
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

      {/* Create/Edit Source Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSource ? 'Edit Scraper Source' : 'Create Scraper Source'}
              </h2>
              {!editingSource && (
                <p className="mt-1 text-sm text-gray-700">
                  Paste a wine retailer URL and let AI detect the selectors for you! 🤖
                </p>
              )}
            </div>
            
            {/* Modal Error/Success Messages */}
            {modalError && (
              <div className={`mx-6 mt-4 p-3 rounded-md border ${
                modalError.startsWith('✅') || modalError.startsWith('✓')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : modalError.startsWith('⚠️')
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="text-sm">{modalError}</p>
              </div>
            )}
            
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
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.base_url}
                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                    placeholder="https://www.monarchwinemerchants.com/collections/wine/Champagne"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wine-600"
                  />
                  <Button
                    type="button"
                    onClick={handleAiDetect}
                    disabled={aiDetecting || !formData.base_url}
                    variant="outline"
                  >
                    {aiDetecting ? '🤖 Detecting...' : '🤖 AI Detect'}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-700">
                  Paste a wine retailer collection page URL, then click AI Detect
                </p>
              </div>

              {/* Product Link Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product Link Selector (CSS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.product_link_selector}
                    onChange={(e) => setFormData({ ...formData, product_link_selector: e.target.value })}
                    placeholder="e.g., .product-item a.product-item__title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wine-600"
                  />
                  <Button
                    type="button"
                    onClick={handleTestSelectors}
                    disabled={testing || !formData.base_url || !formData.product_link_selector}
                    variant="outline"
                  >
                    {testing ? '🧪 Testing...' : '🧪 Test'}
                  </Button>
                </div>
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
                <p className="mt-1 text-xs text-gray-700">CSS selector for the &quot;Next Page&quot; button</p>
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

              {/* Test Results */}
              {testResults && testResults.success && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Results</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Products Found:</span>{' '}
                      <span className={testResults.products_found > 0 ? 'text-green-600' : 'text-red-600'}>
                        {testResults.products_found}
                      </span>
                    </div>
                    {testResults.product_examples && testResults.product_examples.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-900">Examples:</span>
                        <ul className="mt-1 ml-4 list-disc text-gray-700">
                          {testResults.product_examples.map((ex: any, i: number) => (
                            <li key={i} className="truncate">
                              {ex.text} <span className="text-xs text-gray-500">({ex.href})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-900">Pagination:</span>{' '}
                      <span className={testResults.pagination_found ? 'text-green-600' : 'text-gray-500'}>
                        {testResults.pagination_found ? `Found (${testResults.pagination_href})` : 'Not found'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                  {createLoading 
                    ? (editingSource ? 'Updating...' : 'Creating...') 
                    : (editingSource ? 'Update Source' : 'Create Source')
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

