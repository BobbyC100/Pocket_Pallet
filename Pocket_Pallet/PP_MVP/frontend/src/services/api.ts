import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  register: async (data: { email: string; password: string; full_name?: string; role?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

// Wine API
export const wineApi = {
  search: async (query: string, limit = 50, offset = 0) => {
    const response = await api.get('/wines/search', {
      params: { q: query, limit, offset },
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/wines/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/wines', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    const response = await api.put(`/wines/${id}`, data);
    return response.data;
  },
  
  getVersions: async (id: number, limit = 50) => {
    const response = await api.get(`/wines/${id}/versions`, { params: { limit } });
    return response.data;
  },
  
  rollback: async (id: number, versionId: number) => {
    const response = await api.post(`/wines/${id}/rollback/${versionId}`);
    return response.data;
  },
  
  // Drafts
  getDraft: async (wineId: number) => {
    const response = await api.get(`/wines/drafts/wine/${wineId}`);
    return response.data;
  },
  
  saveDraft: async (data: any, wineId?: number) => {
    const response = await api.post('/wines/drafts/wine', data, {
      params: wineId ? { wine_id: wineId } : {},
    });
    return response.data;
  },
  
  publishDraft: async (draftId: number, reason?: string) => {
    const response = await api.post(`/wines/drafts/${draftId}/publish`, { reason });
    return response.data;
  },
  
  previewMerge: async (candidateData: any) => {
    const response = await api.post('/wines/preview-merge', candidateData);
    return response.data;
  },
};

// Import API
export const importApi = {
  create: async (formData: FormData) => {
    const response = await api.post('/imports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  list: async (status?: string, limit = 50, offset = 0) => {
    const response = await api.get('/imports', {
      params: { status, limit, offset },
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/imports/${id}`);
    return response.data;
  },
  
  cancel: async (id: number) => {
    const response = await api.post(`/imports/${id}/cancel`);
    return response.data;
  },
  
  // Mappings
  listMappings: async (sourceId?: number) => {
    const response = await api.get('/imports/mappings', {
      params: sourceId ? { source_id: sourceId } : {},
    });
    return response.data;
  },
  
  createMapping: async (data: any) => {
    const response = await api.post('/imports/mappings', data);
    return response.data;
  },
  
  getMapping: async (id: number) => {
    const response = await api.get(`/imports/mappings/${id}`);
    return response.data;
  },
};

// Review Queue API
export const reviewApi = {
  list: async (status = 'pending', importId?: number, minScore?: number, limit = 50, offset = 0) => {
    const response = await api.get('/review-queue', {
      params: {
        status,
        import_id: importId,
        min_score: minScore,
        limit,
        offset,
      },
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/review-queue/${id}`);
    return response.data;
  },
  
  accept: async (id: number, note?: string) => {
    const response = await api.post(`/review-queue/${id}/accept`, { note });
    return response.data;
  },
  
  reject: async (id: number, createNew = true, note?: string) => {
    const response = await api.post(`/review-queue/${id}/reject`, {
      create_new: createNew,
      note,
    });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/review-queue/stats/summary');
    return response.data;
  },
};

