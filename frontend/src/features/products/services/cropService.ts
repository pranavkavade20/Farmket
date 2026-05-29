import api from '@/lib/api';

export interface CropStatusHistory {
  id: number;
  status: 'sown' | 'growing' | 'ready_for_harvest' | 'harvested';
  changed_at: string;
  notes: string;
}

export interface CropTracking {
  id: number;
  product: number;
  product_name: string;
  sow_date: string;
  expected_harvest_date: string;
  current_stage: 'sown' | 'growing' | 'ready_for_harvest' | 'harvested';
  notes: string;
  created_at: string;
  status_history: CropStatusHistory[];
}

export const cropService = {
  createTracking: async (productSlug: string, data: any): Promise<CropTracking> => {
    const response = await api.post(`/products/products/${productSlug}/tracking/`, data);
    return response.data;
  },
  
  getTracking: async (productSlug: string): Promise<CropTracking[]> => {
    const response = await api.get(`/products/products/${productSlug}/tracking/`);
    return response.data; 
  },
  
  updateStage: async (productSlug: string, trackingId: number, stage: string, notes: string = '') => {
    const response = await api.post(`/products/products/${productSlug}/tracking/${trackingId}/update_stage/`, {
      stage,
      notes
    });
    return response.data;
  },
  
  subscribeInterest: async (productSlug: string) => {
    const response = await api.post(`/products/products/${productSlug}/interests/`, {});
    return response.data;
  }
};
