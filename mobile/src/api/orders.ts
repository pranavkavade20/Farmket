import { apiClient } from './client';
import { Product } from './products';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
}

export interface Order {
  id: number;
  status: string;
  total_price: string;
  created_at: string;
}

export const fetchCart = async (): Promise<Cart> => {
  const response = await apiClient.get<Cart[]>('orders/carts/');
  // Assuming the user has one active cart, usually the first one returned
  return response.data[0];
};

export const addToCart = async (productId: number, quantity: number = 1): Promise<CartItem> => {
  const response = await apiClient.post<CartItem>('orders/cart-items/', {
    product_id: productId,
    quantity,
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

export const createOrder = async (shippingAddress: string): Promise<Order> => {
  const response = await apiClient.post<Order>('orders/orders/', {
    shipping_address: shippingAddress,
  });
  return response.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<{ results: Order[] }>('orders/orders/');
  return response.data.results ?? (response.data as unknown as Order[]);
};
