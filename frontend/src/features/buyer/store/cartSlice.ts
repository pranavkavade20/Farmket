import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Cart, CartItemDetail } from '@/features/orders';
import { orderService } from '@/features/orders';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  loading: boolean;
}

const initialState: CartState = {
  cart: null,
  loading: false,
};

export const refreshCartThunk = createAsyncThunk('cart/refresh', async (_, { rejectWithValue }) => {
  try {
    const data = await orderService.getCart();
    return { ...data, items: data.items ?? [] };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to refresh cart');
  }
});

export const addToCartThunk = createAsyncThunk('cart/add', async ({ product, quantity = 1 }: { product: Product; quantity?: number }, { dispatch, rejectWithValue }) => {
  try {
    await orderService.addToCart(product.id, quantity);
    await dispatch(refreshCartThunk()).unwrap();
    toast.success(`${quantity > 1 ? `${quantity} x ` : ''}${product.name} added to cart!`);
  } catch (err: any) {
    toast.error('Could not add to cart. Please try again.');
    return rejectWithValue(err.message || 'Failed to add to cart');
  }
});

export const removeItemThunk = createAsyncThunk('cart/remove', async (itemId: number, { rejectWithValue }) => {
  try {
    await orderService.removeCartItem(itemId);
    toast.success('Item removed');
    return itemId;
  } catch (err: any) {
    toast.error('Failed to remove item');
    return rejectWithValue(err.message || 'Failed to remove item');
  }
});

export const updateQuantityThunk = createAsyncThunk('cart/updateQuantity', async ({ itemId, quantity }: { itemId: number; quantity: number }, { dispatch, rejectWithValue }) => {
  if (quantity < 1) {
    return dispatch(removeItemThunk(itemId)).unwrap();
  }
  try {
    const updated = await orderService.updateCartItem(itemId, quantity);
    return { itemId, updated: updated as CartItemDetail };
  } catch (err: any) {
    toast.error('Failed to update quantity');
    return rejectWithValue(err.message || 'Failed to update quantity');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartLocal: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(refreshCartThunk.rejected, (state) => {
        // Fail silently based on original code, but we stop loading
        state.loading = false;
      })
      .addCase(removeItemThunk.fulfilled, (state, action) => {
        const itemId = action.payload as number;
        if (state.cart) {
          state.cart.items = state.cart.items.filter((i) => i.id !== itemId);
        }
      })
      .addCase(updateQuantityThunk.fulfilled, (state, action) => {
        // action.payload could be the result of remove or update
        // If it was remove, it would have returned `itemId` (number)
        // If it was update, it returned `{ itemId, updated }`
        if (typeof action.payload === 'object' && action.payload !== null && 'updated' in action.payload) {
          const { itemId, updated } = action.payload as { itemId: number, updated: CartItemDetail };
          if (state.cart) {
            state.cart.items = state.cart.items.map((i) => (i.id === itemId ? updated : i));
          }
        }
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;

// Derived selector
export const selectItemCount = (state: { cart: CartState }) => 
  (state.cart.cart?.items ?? []).reduce((s, i) => s + i.quantity, 0);

export default cartSlice.reducer;
