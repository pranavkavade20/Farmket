import { apiClient } from './client';
import { Product } from './products';
import { resolveMediaUrl } from './config';

export interface CartItem {
  id: number;
  cart?: number;
  product: number;
  product_details: Product;
  quantity: number;
  subtotal: string | number;
  added_at?: string;
  is_prebooking?: boolean;
  crop_growth?: number | null;
}

export interface Cart {
  id: number;
  buyer?: number;
  created_at?: string;
  items: CartItem[];
  total_price: string | number;
}

export interface OrderItem {
  id: number;
  order?: number;
  product: number;
  product_name: string;
  farmer?: number;
  quantity: number;
  price?: string | number;
  price_at_purchase?: string | number;
  status: string;
  subtotal: string | number;
  is_prebooking?: boolean;
}

export interface Order {
  id: number;
  order_number?: string;
  buyer?: number;
  status: string;
  total_price?: string;
  total_amount?: string | number;
  delivery_address?: string;
  shipping_address?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface PlaceOrderPayload {
  delivery_address: string;
  payment_method?: string;
  notes?: string;
}

export const fetchCart = async (): Promise<Cart> => {
  const response = await apiClient.get<Cart | Cart[]>('orders/carts/');
  const cartData = Array.isArray(response.data) ? response.data[0] : response.data;
  
  if (cartData?.items) {
    cartData.items = cartData.items.map((item) => {
      if (item.product_details?.images) {
        item.product_details.images = item.product_details.images.map((img) => ({
          ...img,
          image: resolveMediaUrl(img.image) || img.image,
        }));
      }
      return item;
    });
  }
  return cartData;
};

export const addToCart = async (
  productId: number, 
  quantity = 1, 
  isPrebooking = false
): Promise<CartItem> => {
  const response = await apiClient.post<CartItem>('orders/carts/add-item/', {
    product_id: productId,
    quantity,
    is_prebooking: isPrebooking,
  });
  return response.data;
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<CartItem> => {
  const response = await apiClient.patch<CartItem>(`orders/cart-items/${itemId}/`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (itemId: number): Promise<void> => {
  await apiClient.delete(`orders/cart-items/${itemId}/`);
};

export const createOrder = async (payload: PlaceOrderPayload | string): Promise<Order> => {
  const body = typeof payload === 'string' 
    ? { delivery_address: payload } 
    : payload;
  const response = await apiClient.post<Order>('orders/orders/', body);
  return response.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<{ results: Order[] } | Order[]>('orders/orders/');
  if (Array.isArray(response.data)) return response.data;
  return response.data.results || [];
};

export const fetchOrderDetail = async (id: number): Promise<Order> => {
  const response = await apiClient.get<Order>(`orders/orders/${id}/`);
  return response.data;
};

export const cancelOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.patch<Order>(`orders/orders/${id}/cancel/`);
  return response.data;
};

export const updateOrderItemStatus = async (itemId: number, status: string): Promise<void> => {
  await apiClient.post(`orders/order-items/${itemId}/transition_status/`, { status });
};
