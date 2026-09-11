import { apiClient } from './client';
import { resolveMediaUrl } from './config';
import type { User } from './auth';
import type { Product } from './products';
import type { CropGrowth } from './crops';

export interface FarmerProfile {
  id: number;
  user: User;
  farm_name: string;
  farm_size: string;
  location: string;
  latitude?: string | null;
  longitude?: string | null;
  organic_certified: boolean;
  description: string;
  rating: string | number;
  total_sales: number;
}

export interface FarmerProfileResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmerProfile[];
}

/**
 * Normalizes user avatar/media url in farmer profile.
 */
const normalizeFarmerMedia = (profile: FarmerProfile): FarmerProfile => {
  if (profile.user && profile.user.profile_picture) {
    profile.user.profile_picture =
      resolveMediaUrl(profile.user.profile_picture) || profile.user.profile_picture;
  }
  return profile;
};

/**
 * Fetch a farmer's public profile by farmer ID or user ID.
 */
export const fetchFarmerProfile = async (idOrUserId: number | string): Promise<FarmerProfile> => {
  try {
    // 1. First attempt direct profile lookup by ID
    const directRes = await apiClient.get<FarmerProfile>(`accounts/farmers/${idOrUserId}/`);
    return normalizeFarmerMedia(directRes.data);
  } catch (err: any) {
    // 2. If 404, attempt lookup by user ID
    if (err?.response?.status === 404 || typeof idOrUserId === 'number' || !isNaN(Number(idOrUserId))) {
      const userRes = await apiClient.get<FarmerProfileResponse>(`accounts/farmers/?user=${idOrUserId}`);
      if (userRes.data?.results && userRes.data.results.length > 0) {
        return normalizeFarmerMedia(userRes.data.results[0]);
      }
    }
    throw err;
  }
};

/**
 * Fetch all farmers or search farmers
 */
export const fetchFarmers = async (): Promise<FarmerProfile[]> => {
  const res = await apiClient.get<FarmerProfileResponse | FarmerProfile[]>('accounts/farmers/');
  const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
  return list.map(normalizeFarmerMedia);
};
