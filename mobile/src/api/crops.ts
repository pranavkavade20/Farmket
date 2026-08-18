import { apiClient } from './client';

export interface CropGrowth {
  id: number;
  farmer: {
    id: number;
    first_name: string;
    last_name: string;
    farm_name?: string;
  };
  name: string;
  expected_yield: string;
  expected_harvest_date: string;
  planting_date: string;
  status: string;
  description: string;
  price_per_unit: string;
  unit: string;
}

export interface CropsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropGrowth[];
}

export const fetchCrops = async ({ 
  pageParam = 'crops/',
  search = ''
}): Promise<CropsResponse> => {
  let url = pageParam.startsWith('http') ? new URL(pageParam).pathname + new URL(pageParam).search : pageParam;
  
  if (search && !url.includes('search=')) {
    url += url.includes('?') ? `&search=${search}` : `?search=${search}`;
  }

  const response = await apiClient.get<CropsResponse>(url);
  return response.data;
};
