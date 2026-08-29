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

export const fetchProducts = async ({ 
  pageParam = 'products/products/',
  search = ''
}): Promise<ProductsResponse> => {
  let url = pageParam.startsWith('http') ? new URL(pageParam).pathname + new URL(pageParam).search : pageParam;
  
  if (search && !url.includes('search=')) {
    url += url.includes('?') ? `&search=${search}` : `?search=${search}`;
  }

  const response = await apiClient.get<ProductsResponse>(url);
  return response.data;
};

export const fetchProductDetail = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`products/products/${id}/`);
  return response.data;
};
