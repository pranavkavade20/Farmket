import api from '@/lib/api';
import type { Product, ProductFilters, PaginatedResponse, Category, Review } from '@/types';

export const productService = {
  /** GET /api/products/products/ with optional filters */
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products/products/', {
      params: filters,
    });
    return response.data;
  },

  /** GET /api/products/products/{slug}/ */
  getProduct: async (slug: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/products/${slug}/`);
    return response.data;
  },

  /** GET /api/products/products/featured/ */
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/products/featured/');
    return response.data;
  },

  /** GET /api/products/categories/ */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<PaginatedResponse<Category>>('/products/categories/');
    return response.data.results;
  },

  /** POST /api/products/products/ — multipart for image upload */
  createProduct: async (data: FormData): Promise<Product> => {
    const response = await api.post<Product>('/products/products/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** PATCH /api/products/products/{slug}/ */
  updateProduct: async (slug: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.patch<Product>(`/products/products/${slug}/`, data);
    return response.data;
  },

  /** DELETE /api/products/products/{slug}/ */
  deleteProduct: async (slug: string): Promise<void> => {
    await api.delete(`/products/products/${slug}/`);
  },

  /** POST /api/products/products/{slug}/reviews/ */
  createReview: async (slug: string, data: { rating: number; comment: string }): Promise<Review> => {
    const response = await api.post<Review>(`/products/products/${slug}/reviews/`, data);
    return response.data;
  },

  getUpcomingHarvests: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/products/upcoming-harvests/');
    return response.data;
  },

  followProduct: async (slug: string): Promise<void> => {
    await api.post(`/products/products/${slug}/follow/`);
  },

  unfollowProduct: async (slug: string): Promise<void> => {
    await api.post(`/products/products/${slug}/unfollow/`);
  },

  reserveProduct: async (slug: string, quantity: number, expected_delivery_date?: string): Promise<any> => {
    const response = await api.post(`/products/products/${slug}/reserve/`, {
      quantity,
      expected_delivery_date,
    });
    return response.data;
  },

  waitlistProduct: async (slug: string, quantity: number): Promise<any> => {
    const response = await api.post(`/products/products/${slug}/waitlist/`, {
      quantity,
    });
    return response.data;
  },
};
