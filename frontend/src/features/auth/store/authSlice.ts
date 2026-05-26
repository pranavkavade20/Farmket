import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { authService } from '@/features/auth/api/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
};

export const initAuth = createAsyncThunk('auth/init', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return rejectWithValue('No token');
  try {
    const profile = await authService.getProfile();
    return profile;
  } catch (err) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return rejectWithValue('Invalid token');
  }
});

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }: any, { rejectWithValue }) => {
  try {
    const { token, refresh_token, user: userData } = await authService.login({ email, password });
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh_token);
    return userData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Login failed');
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (data: import('@/types').RegisterData, { rejectWithValue }) => {
  try {
    const { token, refresh_token, user: userData } = await authService.register(data);
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh_token);
    return userData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Registration failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  const refreshToken = localStorage.getItem('refresh_token');
  try {
    if (refreshToken) await authService.logout(refreshToken);
  } catch (err) {
    // Proceed with local logout even if server call fails
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { clearAuth, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
