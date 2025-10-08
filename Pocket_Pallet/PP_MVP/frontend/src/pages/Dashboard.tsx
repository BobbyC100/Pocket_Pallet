import React from 'react';
import { Link } from 'react-router-dom';
import { Wine, Upload, ListChecks, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Pocket Pallet Admin Console
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/wines/new" className="card p-6 hover:shadow-md transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Wine className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">New Wine</h3>
              <p className="text-sm text-gray-600">Add single wine</p>
            </div>
          </div>
        </Link>
        
        <Link to="/imports/new" className="card p-6 hover:shadow-md transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import</h3>
              <p className="text-sm text-gray-600">Upload CSV/Excel</p>
            </div>
          </div>
        </Link>
        
        <Link to="/review-queue" className="card p-6 hover:shadow-md transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ListChecks className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Review Queue</h3>
              <p className="text-sm text-gray-600">Pending merges</p>
            </div>
          </div>
        </Link>
        
        <Link to="/wines" className="card p-6 hover:shadow-md transition">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Browse Wines</h3>
              <p className="text-sm text-gray-600">Search catalog</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Features Overview */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Manual Entry</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Create/edit wines with inline validation</li>
              <li>• Auto-save drafts every 1-2 seconds</li>
              <li>• Preview merge before publishing</li>
              <li>• Full version history and rollback</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bulk Import</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Upload CSV, Excel, Parquet, JSONL</li>
              <li>• Resumable uploads for large files</li>
              <li>• Async processing with progress tracking</li>
              <li>• Error reporting and validation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Review Queue</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fuzzy match detection (75-89% confidence)</li>
              <li>• Side-by-side comparison</li>
              <li>• Accept merge or create new wine</li>
              <li>• Detailed match scoring</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Quality</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Shared validation pipeline</li>
              <li>• Text normalization and fuzzy matching</li>
              <li>• Source priority and freshness rules</li>
              <li>• Full audit trail and lineage tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

