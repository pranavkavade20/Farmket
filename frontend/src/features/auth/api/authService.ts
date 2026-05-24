import api from '@/lib/api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  /** POST /api/v1/accounts/login/ — returns JWT tokens + user */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Django simplejwt TokenObtainPairView returns { access, refresh }
    // Our custom endpoint at /accounts/login/ is the same pair view
    const response = await api.post<{ access: string; refresh: string }>(
      '/accounts/login/',
      { email: credentials.email, password: credentials.password }
    );
    // Fetch user profile with the new token
    const meResponse = await api.get<User>('/accounts/me/', {
      headers: { Authorization: `Bearer ${response.data.access}` },
    });
    return {
      token: response.data.access,
      refresh_token: response.data.refresh,
      user: meResponse.data,
    };
  },

  /** POST /api/v1/accounts/register/ */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/accounts/register/', data);
    return response.data;
  },

  /** POST /api/v1/accounts/logout/ — blacklists refresh token */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/accounts/logout/', { refresh_token: refreshToken });
  },

  /** GET /api/v1/accounts/me/ */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/accounts/me/');
    return response.data;
  },

  /** PATCH /api/v1/accounts/me/ */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/accounts/me/', data);
    return response.data;
  },

  /** GET /api/v1/accounts/dashboard-stats/ */
  getDashboardStats: async (): Promise<import('@/types').DashboardStats> => {
    const response = await api.get<import('@/types').DashboardStats>('/accounts/dashboard-stats/');
    return response.data;
  },
};
