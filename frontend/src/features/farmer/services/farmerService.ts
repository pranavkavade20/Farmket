import api from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types';

export interface FarmerProfileUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  user_type: string;
  phone_number?: string;
  address?: string;
  profile_picture?: string | null;
  is_verified: boolean;
  created_at: string;
  is_online?: boolean;
}

export interface FarmerProfileData {
  id: number;
  user: FarmerProfileUser;
  farm_name: string;
  farm_size: number | string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  organic_certified: boolean;
  description: string;
  rating: string | number;
  total_sales: number;
}

export const farmerService = {
  /**
   * Fetch farmer profile by ID or by User ID.
   * First attempts /accounts/farmers/:id/, falls back to /accounts/farmers/?user=:id
   */
  getFarmerProfile: async (id: string | number): Promise<FarmerProfileData> => {
    try {
      const response = await api.get<FarmerProfileData>(`/accounts/farmers/${id}/`);
      return response.data;
    } catch {
      // Fallback query by user_id
      const queryResponse = await api.get<PaginatedResponse<FarmerProfileData>>('/accounts/farmers/', {
        params: { user: id },
      });
      if (queryResponse.data?.results && queryResponse.data.results.length > 0) {
        return queryResponse.data.results[0];
      }
      throw new Error('Farmer profile not found');
    }
  },

  /** Update farmer profile specifications */
  updateFarmerProfile: async (id: number, data: Partial<FarmerProfileData>): Promise<FarmerProfileData> => {
    const response = await api.patch<FarmerProfileData>(`/accounts/farmers/${id}/`, data);
    return response.data;
  },

  /** Get all produce listed by this specific farmer */
  getFarmerProducts: async (farmerUserId: number): Promise<Product[]> => {
    const response = await api.get<PaginatedResponse<Product>>('/products/products/', {
      params: { farmer: farmerUserId },
    });
    return response.data.results;
  },
};

