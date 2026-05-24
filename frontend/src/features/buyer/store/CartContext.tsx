import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { Cart, CartItemDetail } from '@/features/orders';
import { orderService } from '@/features/orders';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const data = await orderService.getCart();
      // Ensure items is always an array — Django may omit it for brand-new carts
      setCart({ ...data, items: data.items ?? [] });
    } catch {
      // Fail silently — cart will load on next interaction
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user signs in
  useEffect(() => {
    if (user) {
      void refreshCart();
    } else {
      setCart(null);
    }
  }, [user, refreshCart]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    try {
      await orderService.addToCart(product.id, quantity);
      await refreshCart();
      toast.success(`${quantity > 1 ? `${quantity} x ` : ''}${product.name} added to cart!`);
    } catch {
      toast.error('Could not add to cart. Please try again.');
    }
  }, [refreshCart]);

  const removeItem = useCallback(async (itemId: number) => {
    try {
      await orderService.removeCartItem(itemId);
      setCart((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev
      );
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity < 1) { await removeItem(itemId); return; }
    try {
      const updated = await orderService.updateCartItem(itemId, quantity);
      setCart((prev) =>
        prev
          ? { ...prev, items: prev.items.map((i) => (i.id === itemId ? (updated as CartItemDetail) : i)) }
          : prev
      );
    } catch {
      toast.error('Failed to update quantity');
    }
  }, [removeItem]);

  const clearCartLocal = useCallback(() => setCart(null), []);

  // Use (items ?? []) as an extra safety net even after the normalisation above
  const itemCount = useMemo(() => (cart?.items ?? []).reduce((s, i) => s + i.quantity, 0), [cart]);

  const value = useMemo(
    () => ({ cart, itemCount, loading, addToCart, removeItem, updateQuantity, refreshCart, clearCartLocal }),
    [cart, itemCount, loading, addToCart, removeItem, updateQuantity, refreshCart, clearCartLocal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
