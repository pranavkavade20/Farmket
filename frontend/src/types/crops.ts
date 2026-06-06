export enum CropStage {
  PLANTED = "PLANTED",
  GROWING = "GROWING",
  NEAR_HARVEST = "NEAR_HARVEST",
  HARVESTED = "HARVESTED",
}

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
  crop_growth: number;
  crop_name: string;
  quantity_reserved: string;
  reservation_status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reserved_at: string;
  expected_delivery_date: string | null;
}

export interface CropGrowth {
  id: number;
  farmer: number;
  farmer_name: string;
  crop_name: string;
  product: number | null;
  product_details: any;
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
