import { apiClient } from './client';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  unit: string;
  category: {
    id: number;
    name: string;
  };
  farmer: {
    id: number;
    first_name: string;
    last_name: string;
    farm_name?: string;
  };
  stock_quantity: number;
  is_available: boolean;
  images: Array<{
    id: number;
    image: string;
    is_primary: boolean;
  }>;
  average_rating: number;
  reviews_count: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export const fetchProducts = async (): Promise<ProductsResponse> => {
  const response = await apiClient.get<ProductsResponse>('products/products/');
  return response.data;
};
