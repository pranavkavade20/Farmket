import { configureStore } from '@reduxjs/toolkit';
import appReducer from '@/features/app/appSlice';
import themeReducer from '@/features/theme/themeSlice';
import authReducer from '@/features/auth/store/authSlice';
import cartReducer from '@/features/buyer/store/cartSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    theme: themeReducer,
    auth: authReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
