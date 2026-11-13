export type CropStage = "PLANTED" | "GROWING" | "NEAR_HARVEST" | "HARVESTED";

export interface CropStageHistory {
  id: number;
  previous_stage: CropStage | null;
  current_stage: CropStage;
  updated_by: number | null;
  updated_by_name: string;
  remarks: string;
  timestamp: string;
}

export interface CropReservation {
  id: number;
  buyer: number;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  crop_growth: number;
  crop_name: string;
  farmer_name?: string;
  farmer_id?: number;
  farmer_phone?: string;
  unit?: string;
  price?: string;
  crop_stage?: CropStage;
  expected_harvest_date?: string;
  product_slug?: string | null;
  image?: string | null;
  quantity_reserved: string;
  reservation_status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reserved_at: string;
  expected_delivery_date: string | null;
}

import type { Product } from './index';

export interface CropGrowth {
  id: number;
  farmer: number;
  farmer_name: string;
  crop_name: string;
  product: number | null;
  product_details: Partial<Product> | null;
  sowing_date: string;
  expected_harvest_date: string;
  actual_harvest_date: string | null;
  expected_quantity: string;
  available_quantity: string;
  stage: CropStage;
  progress: number;
  organic: boolean;
  notes: string;
  created_at: string;
  last_updated: string;
  stage_history: CropStageHistory[];
  reservations: CropReservation[];
  followers_count: number;
  is_followed: boolean;
}
