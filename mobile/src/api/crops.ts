import { apiClient } from './client';
import type { Product } from './products';

export type CropStageType = 'PLANTED' | 'GROWING' | 'NEAR_HARVEST' | 'HARVESTED';
export type ReservationStatusType = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface CropStageHistory {
  id: number;
  previous_stage: CropStageType | null;
  current_stage: CropStageType;
  updated_by: number;
  updated_by_name: string;
  remarks: string;
  timestamp: string;
}

export interface CropReservation {
  id: number;
  buyer: number;
  buyer_name: string;
  crop_growth: number;
  crop_name: string;
  quantity_reserved: string | number;
  reservation_status: ReservationStatusType;
  reserved_at: string;
  expected_delivery_date?: string;
}

export interface CropGrowth {
  id: number;
  farmer: number;
  farmer_name: string;
  crop_name: string;
  product?: number;
  product_details?: Product;
  sowing_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string | null;
  expected_quantity: string | number;
  available_quantity: string | number;
  stage: CropStageType;
  progress: number;
  organic: boolean;
  notes: string;
  created_at: string;
  last_updated: string;
  stage_history?: CropStageHistory[];
  reservations?: CropReservation[];
  followers_count?: number;
  is_followed?: boolean;
}

export interface CropsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropGrowth[];
}

export interface ReservationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropReservation[];
}

export const fetchCrops = async ({ 
  pageParam = 'crops/',
  search = '',
  stage = '',
}: {
  pageParam?: string;
  search?: string;
  stage?: string;
} = {}): Promise<CropsResponse> => {
  let url = pageParam;
  if (url.startsWith('http')) {
    const parsed = new URL(url);
    url = (parsed.pathname + parsed.search).replace(/^\/?api\//, '');
  } else if (url.startsWith('/api/')) {
    url = url.replace(/^\/?api\//, '');
  }
  const params: string[] = [];

  if (search && !url.includes('search=')) {
    params.push(`search=${encodeURIComponent(search)}`);
  }
  if (stage && !url.includes('stage=')) {
    params.push(`stage=${encodeURIComponent(stage)}`);
  }

  if (params.length > 0) {
    url += (url.includes('?') ? '&' : '?') + params.join('&');
  }

  const response = await apiClient.get<CropsResponse | CropGrowth[]>(url);
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
};

export const fetchCropDetail = async (id: number): Promise<CropGrowth> => {
  const response = await apiClient.get<CropGrowth>(`crops/${id}/`);
  return response.data;
};

export const fetchUpcomingHarvests = async (): Promise<CropGrowth[]> => {
  const response = await apiClient.get<CropsResponse | CropGrowth[]>('crops/upcoming/');
  if (Array.isArray(response.data)) return response.data;
  return response.data.results || [];
};

export const createCrop = async (payload: Partial<CropGrowth>): Promise<CropGrowth> => {
  const response = await apiClient.post<CropGrowth>('crops/', payload);
  return response.data;
};

export const updateCropStage = async (id: number, payload: { stage: CropStageType; remarks?: string }): Promise<CropGrowth> => {
  const response = await apiClient.post<CropGrowth>(`crops/${id}/update_stage/`, payload);
  return response.data;
};

export const reserveCrop = async (id: number, payload: { quantity: number; expected_delivery_date?: string }): Promise<CropReservation> => {
  const response = await apiClient.post<CropReservation>(`crops/${id}/reserve/`, payload);
  return response.data;
};

export const followCrop = async (id: number): Promise<void> => {
  await apiClient.post(`crops/${id}/follow/`);
};

export const unfollowCrop = async (id: number): Promise<void> => {
  await apiClient.post(`crops/${id}/unfollow/`);
};

export const fetchReservations = async (): Promise<CropReservation[]> => {
  const response = await apiClient.get<ReservationsResponse | CropReservation[]>('crops/reservations/');
  if (Array.isArray(response.data)) return response.data;
  return response.data.results || [];
};

export const approveReservation = async (id: number): Promise<void> => {
  await apiClient.post(`crops/reservations/${id}/approve/`);
};

export const rejectReservation = async (id: number): Promise<void> => {
  await apiClient.post(`crops/reservations/${id}/reject/`);
};
