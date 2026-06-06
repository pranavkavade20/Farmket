import React, { useEffect, useCallback, useMemo } from 'react';
import type { Cart, CartItemDetail } from '@/features/orders';
import type { Product } from '@/types';
import { useAuth } from '@/features/auth';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { 
  refreshCartThunk, 
  addToCartThunk, 
  removeItemThunk, 
  updateQuantityThunk, 
  clearCartLocal as clearCartLocalAction,
  selectItemCount
} from './cartSlice';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartLocal: () => void;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Load cart when user signs in and is a buyer
  useEffect(() => {
    if (user && user.user_type === 'buyer') {
      void dispatch(refreshCartThunk());
    } else {
      dispatch(clearCartLocalAction());
    }
  }, [user, dispatch]);

  return <>{children}</>;
};

export const useCart = (): CartContextType => {
  const cart = useAppSelector(state => state.cart.cart);
  const loading = useAppSelector(state => state.cart.loading);
  const itemCount = useAppSelector(selectItemCount);
  const dispatch = useAppDispatch();

  const refreshCart = useCallback(async () => {
    await dispatch(refreshCartThunk()).unwrap();
  }, [dispatch]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    await dispatch(addToCartThunk({ product, quantity })).unwrap();
  }, [dispatch]);

  const removeItem = useCallback(async (itemId: number) => {
    await dispatch(removeItemThunk(itemId)).unwrap();
  }, [dispatch]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    await dispatch(updateQuantityThunk({ itemId, quantity })).unwrap();
  }, [dispatch]);

  const clearCartLocal = useCallback(() => {
    dispatch(clearCartLocalAction());
  }, [dispatch]);

  return useMemo(
    () => ({ 
      cart, 
      itemCount, 
      loading, 
      addToCart, 
      removeItem, 
      updateQuantity, 
      refreshCart, 
      clearCartLocal 
    }),
    [cart, itemCount, loading, addToCart, removeItem, updateQuantity, refreshCart, clearCartLocal]
  );
};
