import api from '@/lib/api';
import type { PaginatedResponse } from '@/types';

export interface BuyerProfileData {
  id: number;
  company_name: string;
  delivery_address: string;
  preferences: string;
}

export const buyerService = {
  /**
   * Fetch buyer profile for the logged in user
   */
  getBuyerProfile: async (userId: number): Promise<BuyerProfileData | null> => {
    try {
      const res = await api.get<PaginatedResponse<BuyerProfileData>>('/accounts/buyers/', {
        params: { user: userId },
      });
      if (res.data?.results && res.data.results.length > 0) {
        return res.data.results[0];
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Update buyer company or delivery details
   */
  updateBuyerProfile: async (id: number, data: Partial<BuyerProfileData>): Promise<BuyerProfileData> => {
    const res = await api.patch<BuyerProfileData>(`/accounts/buyers/${id}/`, data);
    return res.data;
  },
};

export default buyerService;

