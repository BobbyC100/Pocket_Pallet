// Core types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'viewer' | 'editor' | 'importer' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Wine {
  id: number;
  producer_id: number;
  cuvee?: string;
  vintage?: number;
  is_nv: boolean;
  country_id?: number;
  region_id?: number;
  subregion?: string;
  grape_ids?: number[];
  grape_percentages?: Record<string, number>;
  abv?: number;
  bottle_size?: string;
  wine_type?: string;
  style?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_seen_at?: string;
}

export interface WineWithRelations extends Wine {
  producer_name?: string;
  country_name?: string;
  region_name?: string;
  grape_names?: string[];
}

export interface Draft {
  id: number;
  entity_type: string;
  entity_id?: number;
  data_json: Record<string, any>;
  author_id: number;
  lock_expires_at?: string;
  updated_at: string;
  created_at: string;
}

export interface ImportJob {
  id: number;
  source_id: number;
  mapping_id?: number;
  created_by: number;
  filename: string;
  file_format: 'csv' | 'parquet' | 'jsonl' | 'xlsx';
  file_size_bytes?: number;
  storage_path?: string;
  checksum?: string;
  status: ImportStatus;
  total_rows?: number;
  processed_rows?: number;
  success_count?: number;
  error_count?: number;
  review_count?: number;
  validation_errors?: Record<string, any>;
  validation_warnings?: Record<string, any>;
  stats?: Record<string, any>;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export type ImportStatus =
  | 'pending'
  | 'uploading'
  | 'validating'
  | 'processing'
  | 'reviewing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface MergeCandidate {
  id: number;
  import_job_id: number;
  candidate_json: Record<string, any>;
  candidate_hash: string;
  source_row_number?: number;
  target_wine_id?: number;
  match_score: number;
  match_details?: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected' | 'skipped';
  reviewer_id?: number;
  reviewed_at?: string;
  note?: string;
  created_at: string;
  target_wine_data?: WineData;
}

export interface WineData {
  id: number;
  producer?: string;
  cuvee?: string;
  vintage?: number;
  is_nv: boolean;
  abv?: number;
  wine_type?: string;
}

export interface Producer {
  id: number;
  name: string;
  normalized_name: string;
  country?: string;
  region?: string;
  website?: string;
  notes?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

