import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { reviewApi } from '@/services/api';
import { MergeCandidate } from '@/types';
import toast from 'react-hot-toast';

export const ReviewQueue: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['review-queue'],
    queryFn: () => reviewApi.list('pending'),
  });
  
  const { data: stats } = useQuery({
    queryKey: ['review-queue-stats'],
    queryFn: () => reviewApi.getStats(),
  });
  
  const acceptMutation = useMutation({
    mutationFn: (id: number) => reviewApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['review-queue-stats'] });
      toast.success('Merge accepted');
    },
    onError: () => {
      toast.error('Failed to accept merge');
    },
  });
  
  const rejectMutation = useMutation({
    mutationFn: ({ id, createNew }: { id: number; createNew: boolean }) =>
      reviewApi.reject(id, createNew),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['review-queue-stats'] });
      toast.success('Merge rejected');
    },
    onError: () => {
      toast.error('Failed to reject merge');
    },
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Queue</h1>
        <p className="mt-2 text-gray-600">
          Review fuzzy matches and decide whether to merge or create new wines.
        </p>
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_pending}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.by_score_range?.['0.90-1.00'] || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.by_score_range?.['0.75-0.79'] || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      )}
      
      {/* Candidates */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card p-8 text-center text-gray-500">
            Loading review queue...
          </div>
        ) : candidates && candidates.length > 0 ? (
          candidates.map((candidate: MergeCandidate) => (
            <div key={candidate.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {(candidate.match_score * 100).toFixed(0)}% Match
                    </span>
                    <span className="text-sm text-gray-500">
                      Import #{candidate.import_job_id}
                      {candidate.source_row_number && ` • Row ${candidate.source_row_number}`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Candidate (New) */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        New Wine (Candidate)
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Producer:</span>{' '}
                          {candidate.candidate_json.producer || 'N/A'}
                        </div>
                        {candidate.candidate_json.cuvee && (
                          <div>
                            <span className="font-medium">Cuvée:</span>{' '}
                            {candidate.candidate_json.cuvee}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Vintage:</span>{' '}
                          {candidate.candidate_json.is_nv
                            ? 'NV'
                            : candidate.candidate_json.vintage || 'N/A'}
                        </div>
                        {candidate.candidate_json.abv && (
                          <div>
                            <span className="font-medium">ABV:</span>{' '}
                            {candidate.candidate_json.abv}%
                          </div>
                        )}
                        {candidate.candidate_json.wine_type && (
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {candidate.candidate_json.wine_type}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Target (Existing) */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Existing Wine (Target)
                      </h3>
                      {candidate.target_wine_data ? (
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Producer:</span>{' '}
                            {candidate.target_wine_data.producer || 'N/A'}
                          </div>
                          {candidate.target_wine_data.cuvee && (
                            <div>
                              <span className="font-medium">Cuvée:</span>{' '}
                              {candidate.target_wine_data.cuvee}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Vintage:</span>{' '}
                            {candidate.target_wine_data.is_nv
                              ? 'NV'
                              : candidate.target_wine_data.vintage || 'N/A'}
                          </div>
                          {candidate.target_wine_data.abv && (
                            <div>
                              <span className="font-medium">ABV:</span>{' '}
                              {candidate.target_wine_data.abv}%
                            </div>
                          )}
                          {candidate.target_wine_data.wine_type && (
                            <div>
                              <span className="font-medium">Type:</span>{' '}
                              {candidate.target_wine_data.wine_type}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Wine ID: {candidate.target_wine_data.id}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No target wine data</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Match Details */}
                  {candidate.match_details && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                      <span className="font-medium">Match Details:</span>{' '}
                      {Object.entries(candidate.match_details).map(([key, value]) => (
                        <span key={key} className="ml-2">
                          {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => rejectMutation.mutate({ id: candidate.id, createNew: true })}
                  disabled={rejectMutation.isPending}
                  className="btn-secondary px-4 py-2"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject & Create New
                </button>
                <button
                  onClick={() => acceptMutation.mutate(candidate.id)}
                  disabled={acceptMutation.isPending}
                  className="btn-primary px-4 py-2"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept & Merge
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-8 text-center text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="mt-2">No pending merges to review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

