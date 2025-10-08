import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { importApi } from '@/services/api';
import { ImportJob, ImportStatus } from '@/types';
import { format } from 'date-fns';

const statusIcons: Record<ImportStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5 text-gray-400" />,
  uploading: <Upload className="h-5 w-5 text-blue-500 animate-pulse" />,
  validating: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  processing: <Clock className="h-5 w-5 text-blue-500 animate-pulse" />,
  reviewing: <AlertCircle className="h-5 w-5 text-orange-500" />,
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  failed: <XCircle className="h-5 w-5 text-red-500" />,
  cancelled: <XCircle className="h-5 w-5 text-gray-500" />,
};

export const ImportList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ImportStatus | ''>('');
  
  const { data: imports, isLoading } = useQuery({
    queryKey: ['imports', statusFilter],
    queryFn: () => importApi.list(statusFilter || undefined),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Imports</h1>
        <Link to="/imports/new" className="btn-primary px-4 py-2">
          <Upload className="h-4 w-4 mr-2" />
          New Import
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ImportStatus | '')}
          className="input w-48"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="reviewing">Reviewing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      {/* Imports Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading imports...
          </div>
        ) : imports && imports.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {imports.map((importJob: ImportJob) => (
                <tr key={importJob.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {statusIcons[importJob.status]}
                      <span className="text-sm capitalize">{importJob.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {importJob.filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {importJob.file_format.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {importJob.total_rows ? (
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {importJob.processed_rows || 0} / {importJob.total_rows}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${((importJob.processed_rows || 0) / importJob.total_rows) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      {importJob.success_count !== undefined && (
                        <div className="text-green-600">
                          ✓ {importJob.success_count} success
                        </div>
                      )}
                      {importJob.error_count !== undefined && importJob.error_count > 0 && (
                        <div className="text-red-600">
                          ✗ {importJob.error_count} errors
                        </div>
                      )}
                      {importJob.review_count !== undefined && importJob.review_count > 0 && (
                        <div className="text-orange-600">
                          ? {importJob.review_count} review
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(importJob.created_at), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/imports/${importJob.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No imports found. Start your first bulk import!
          </div>
        )}
      </div>
    </div>
  );
};

