import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Cart, 
  fetchCart, 
  addToCart as apiAddToCart, 
  updateCartItem as apiUpdateCartItem, 
  removeCartItem as apiRemoveCartItem, 
  createOrder as apiCreateOrder,
  PlaceOrderPayload
} from '../api/orders';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number, isPrebooking?: boolean) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  checkout: (payload: PlaceOrderPayload | string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user || user.user_type !== 'buyer') {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchCart();
      setCart(data);
    } catch (error) {
      console.log('[Cart] Fetch cart notice:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity = 1, isPrebooking = false) => {
    try {
      await apiAddToCart(productId, quantity, isPrebooking);
      await refreshCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await apiUpdateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await apiRemoveCartItem(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const checkout = async (payload: PlaceOrderPayload | string) => {
    try {
      await apiCreateOrder(payload);
      await refreshCart();
    } catch (error) {
      console.error('Failed to checkout:', error);
      throw error;
    }
  };

  const itemCount = cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading, 
        itemCount, 
        refreshCart, 
        addToCart, 
        updateQuantity, 
        removeItem,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
