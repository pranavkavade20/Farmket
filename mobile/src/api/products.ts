import { apiClient } from './client';
import { resolveMediaUrl } from './config';

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  uploaded_at?: string;
}

export interface Review {
  id: number;
  buyer: number;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  product_count?: number;
}

export interface Product {
  id: number;
  farmer: number | { id: number; first_name?: string; last_name?: string; farm_name?: string };
  farmer_name: string;
  category: number | Category;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  unit: string;
  stock_quantity: number;
  minimum_order?: number;
  is_organic: boolean;
  harvest_date?: string;
  is_available: boolean;
  views?: number;
  created_at?: string;
  updated_at?: string;
  images: ProductImage[];
  reviews: Review[];
  in_stock: boolean;
  market_state?: 'AVAILABLE_NOW' | 'READY_FOR_PREBOOKING' | 'READY_TO_HARVEST' | 'LOW_STOCK' | 'SOLD_OUT' | string;
  crop_stage?: 'PLANTED' | 'GROWING' | 'NEAR_HARVEST' | 'HARVESTED' | null;
  progress_percentage?: number;
  harvest_countdown?: number;
  reservation_count?: number;
  reserved_quantity?: number;
  available_quantity?: number;
  is_prebookable?: boolean;
  is_following?: boolean;
  active_crop_growth_id?: number | null;
  average_rating?: number;
  reviews_count?: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface FetchProductsParams {
  pageParam?: string;
  search?: string;
  category__slug?: string;
  is_organic?: boolean;
  ordering?: string;
  limit?: number;
  farmer?: number;
}

const normalizeProductMedia = (product: Product): Product => {
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map((img) => ({
      ...img,
      image: resolveMediaUrl(img.image) || img.image,
    }));
  }
  return product;
};

export const fetchProducts = async (params: FetchProductsParams = {}): Promise<ProductsResponse> => {
  const { pageParam = 'products/products/', search, category__slug, is_organic, ordering, limit, farmer } = params;
  let url = pageParam;
  if (url.startsWith('http')) {
    const parsed = new URL(url);
    url = (parsed.pathname + parsed.search).replace(/^\/?api\//, '');
  } else if (url.startsWith('/api/')) {
    url = url.replace(/^\/?api\//, '');
  }
  
  const queryParams: string[] = [];

  if (search && !url.includes('search=')) {
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (category__slug && !url.includes('category__slug=')) {
    queryParams.push(`category__slug=${encodeURIComponent(category__slug)}`);
  }
  if (is_organic && !url.includes('is_organic=')) {
    queryParams.push(`is_organic=true`);
  }
  if (ordering && !url.includes('ordering=')) {
    queryParams.push(`ordering=${encodeURIComponent(ordering)}`);
  }
  if (limit && !url.includes('limit=')) {
    queryParams.push(`limit=${limit}`);
  }
  if (farmer && !url.includes('farmer=')) {
    queryParams.push(`farmer=${farmer}`);
  }

  if (queryParams.length > 0) {
    url += (url.includes('?') ? '&' : '?') + queryParams.join('&');
  }

  const response = await apiClient.get<ProductsResponse | Product[]>(url);
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data.map(normalizeProductMedia),
    };
  }

  return {
    ...response.data,
    results: (response.data.results || []).map(normalizeProductMedia),
  };
};

export const fetchProductDetail = async (idOrSlug: number | string): Promise<Product> => {
  const response = await apiClient.get<Product>(`products/products/${idOrSlug}/`);
  return normalizeProductMedia(response.data);
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('products/products/featured/');
  return (response.data || []).map(normalizeProductMedia);
};

export const fetchUpcomingHarvests = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('products/products/upcoming-harvests/');
  return (response.data || []).map(normalizeProductMedia);
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[] | { results: Category[] }>('products/categories/');
  const rawList = Array.isArray(response.data) ? response.data : (response.data.results || []);
  return rawList.map((cat) => ({
    ...cat,
    image: resolveMediaUrl(cat.image) || undefined,
  }));
};

export const createProductReview = async (slug: string, payload: { rating: number; comment: string }): Promise<Review> => {
  const response = await apiClient.post<Review>(`products/products/${slug}/reviews/`, payload);
  return response.data;
};

export const followProduct = async (slug: string): Promise<void> => {
  await apiClient.post(`products/products/${slug}/follow/`);
};

export const unfollowProduct = async (slug: string): Promise<void> => {
  await apiClient.post(`products/products/${slug}/unfollow/`);
};

export const reserveProduct = async (slug: string, quantity: number, expectedDeliveryDate?: string): Promise<unknown> => {
  const response = await apiClient.post(`products/products/${slug}/reserve/`, {
    quantity,
    expected_delivery_date: expectedDeliveryDate,
  });
  return response.data;
};
