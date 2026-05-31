import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/types';

// ── Cart types aligned with Django models ─────────────────────────────────────
export interface CartItemDetail {
  id: number;
  cart: number;
  product: number;
  product_details: {
    id: number;
    name: string;
    slug: string;
    price: string;
    unit: string;
    farmer_name: string;
    images: { id: number; image: string; is_primary: boolean }[];
    in_stock: boolean;
    stock_quantity: number;
  };
  quantity: number;
  added_at: string;
  subtotal: number;
  is_prebooking: boolean;
  crop_growth: number | null;
}

export interface Cart {
  id: number;
  buyer: number;
  created_at: string;
  items: CartItemDetail[];
  total_price: number;
}

export interface PlaceOrderPayload {
  delivery_address: string;
  payment_method: 'cod' | 'online' | 'upi';
  notes?: string;
}

export const orderService = {
  // ── Cart ──────────────────────────────────────────────────────────────────
  getCart: async (): Promise<Cart> => {
    const res = await api.get<Cart>('/orders/carts/');
    // CartViewSet returns a single object (get_object uses get_or_create)
    return res.data;
  },

  addToCart: async (productId: number, quantity = 1, is_prebooking = false): Promise<CartItemDetail> => {
    const res = await api.post<CartItemDetail>('/orders/carts/add-item/', {
      product_id: productId,
      quantity,
      is_prebooking,
    });
    return res.data;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<CartItemDetail> => {
    const res = await api.patch<CartItemDetail>(`/orders/cart-items/${itemId}/`, { quantity });
    return res.data;
  },

  removeCartItem: async (itemId: number): Promise<void> => {
    await api.delete(`/orders/cart-items/${itemId}/`);
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  getOrders: async (): Promise<PaginatedResponse<Order>> => {
    const res = await api.get<PaginatedResponse<Order>>('/orders/orders/');
    return res.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const res = await api.get<Order>(`/orders/orders/${id}/`);
    return res.data;
  },

  placeOrder: async (payload: PlaceOrderPayload): Promise<Order> => {
    const res = await api.post<Order>('/orders/orders/', payload);
    return res.data;
  },

  cancelOrder: async (id: number): Promise<Order> => {
    const res = await api.patch<Order>(`/orders/orders/${id}/cancel/`);
    return res.data;
  },
};
