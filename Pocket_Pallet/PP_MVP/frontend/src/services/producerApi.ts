// Producer API client
import api from './api';
import type { ProducerCard, ProducerCardCreate, ProducerCardUpdate, ProducerBoostResult } from '@/types/producerCard';

export const producerApi = {
  search: async (query: string, limit = 50): Promise<ProducerCard[]> => {
    const response = await api.get('/producers/search', {
      params: { q: query, limit },
    });
    return response.data;
  },
  
  list: async (limit = 100, offset = 0, classFilter?: string): Promise<ProducerCard[]> => {
    const response = await api.get('/producers', {
      params: { limit, offset, class_filter: classFilter },
    });
    return response.data;
  },
  
  getById: async (id: number): Promise<ProducerCard> => {
    const response = await api.get(`/producers/${id}`);
    return response.data;
  },
  
  create: async (data: ProducerCardCreate): Promise<ProducerCard> => {
    const response = await api.post('/producers', data);
    return response.data;
  },
  
  update: async (id: number, data: ProducerCardUpdate): Promise<ProducerCard> => {
    const response = await api.put(`/producers/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/producers/${id}`);
  },
  
  getBoost: async (id: number): Promise<ProducerBoostResult> => {
    const response = await api.get(`/producers/${id}/boost`);
    return response.data;
  },
};

