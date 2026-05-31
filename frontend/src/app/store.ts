import { configureStore } from '@reduxjs/toolkit';
import appReducer from '@/features/app/appSlice';
import themeReducer from '@/features/theme/themeSlice';
import authReducer from '@/features/auth/store/authSlice';
import cartReducer from '@/features/buyer/store/cartSlice';

import { apiSlice } from './api/apiSlice';
import cropsReducer from '@/features/crops/cropsSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    theme: themeReducer,
    auth: authReducer,
    cart: cartReducer,
    crops: cropsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
