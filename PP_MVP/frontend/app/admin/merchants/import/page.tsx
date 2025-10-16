'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/app/services/api';

export default function MerchantImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      // Read file as text
      const text = await file.text();
      const data = JSON.parse(text);

      // Parse Google Maps GeoJSON format
      const merchants = [];
      
      if (data.type === 'FeatureCollection' && data.features) {
        for (const feature of data.features) {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates || [];
          
          const name = props.name || props.Name || props.Title;
          if (!name) continue;

          merchants.push({
            name,
            address: props.address || props.Address || props['Location Address'] || null,
            lat: coords[1] || null,
            lng: coords[0] || null,
            country_code: props['Country Code'] || null,
            source_url: props.google_maps_url || props['Google Maps URL'] || props.url || null,
            tags: ['Imported from Google Maps'],
          });
        }
      } else if (Array.isArray(data)) {
        // Handle plain JSON array
        for (const item of data) {
          const name = item.name || item.Name;
          if (!name) continue;

          merchants.push({
            name,
            address: item.address || null,
            lat: item.lat || item.latitude || null,
            lng: item.lng || item.longitude || null,
            country_code: item.country_code || null,
            source_url: item.url || item.google_maps_url || null,
            tags: ['Imported from Google Maps'],
          });
        }
      } else {
        throw new Error('Unsupported file format. Expected GeoJSON or JSON array.');
      }

      if (merchants.length === 0) {
        throw new Error('No valid merchants found in file');
      }

      // Send to backend
      const res = await api.post('/api/v1/merchants/import', {
        merchants,
        overwrite_existing: overwriteExisting,
      });

      setResult(res.data);
      
      // Show success message
      if (res.data.created > 0 || res.data.updated > 0) {
        setTimeout(() => {
          router.push('/merchants');
        }, 3000);
      }

    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to import merchants');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-wine-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Import Merchants</h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload Google Maps Saved Places JSON export
              </p>
            </div>
            <Link
              href="/merchants"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Merchants
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Google Maps Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">How to export from Google Maps:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://takeout.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Takeout</a></li>
                <li>Select only &quot;Maps&quot; (deselect all others)</li>
                <li>Click &quot;All Maps data included&quot; → Select &quot;Saved Places&quot;</li>
                <li>Choose JSON format and download</li>
                <li>Upload the <code className="bg-blue-100 px-1 rounded">Saved Places.json</code> file below</li>
              </ol>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={importing}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:border-wine-500"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Overwrite Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="overwrite"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                disabled={importing}
                className="h-4 w-4 text-wine-600 border-gray-300 rounded focus:ring-wine-600"
              />
              <label htmlFor="overwrite" className="ml-2 text-sm text-gray-900">
                Update existing merchants (if unchecked, duplicates will be skipped)
              </label>
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full bg-wine-600 hover:bg-wine-700 text-white"
            >
              {importing ? 'Importing...' : 'Import Merchants'}
            </Button>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Import Complete!</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>✓ Created: {result.created} merchants</p>
                  <p>✓ Updated: {result.updated} merchants</p>
                  <p>⊘ Skipped: {result.skipped} merchants</p>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside">
                        {result.errors.map((err: string, i: number) => (
                          <li key={i} className="text-red-600">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Redirecting to merchants page...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example Data Format */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Expected File Format</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-x-auto">
{`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-118.15, 33.77]
      },
      "properties": {
        "name": "Buvons",
        "address": "1145 Loma Ave, Long Beach, CA",
        "google_maps_url": "https://maps.google.com/...",
        "Country Code": "US"
      }
    }
  ]
}`}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

