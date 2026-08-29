import { apiClient } from './client';

export interface User {
  id: number;
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  user_type: 'farmer' | 'buyer' | 'admin' | string;
  gender?: 'male' | 'female' | 'others' | '';
  phone_number?: string;
  address?: string;
  profile_picture?: string | null;
  is_verified?: boolean;
  farm_name?: string;
  created_at?: string;
  is_online?: boolean;
}

export interface RegisterPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  user_type: 'farmer' | 'buyer' | string;
  phone_number?: string;
  gender?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  total_products?: number;
  total_revenue?: number;
}

export const loginApi = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('accounts/login/', credentials);
  return response.data;
};

export const registerApi = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('accounts/register/', payload);
  return response.data;
};

export const getCurrentUserApi = async (): Promise<User> => {
  const response = await apiClient.get<User>('accounts/me/');
  return response.data;
};

export const updateProfileApi = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.patch<User>('accounts/me/', data);
  return response.data;
};

export const logoutApi = async (refreshToken?: string | null): Promise<void> => {
  if (refreshToken) {
    try {
      await apiClient.post('accounts/logout/', { refresh_token: refreshToken });
    } catch {
      // Ignore logout blacklist errors if expired
    }
  }
};

export const changePasswordApi = async (oldPassword: string, newPassword: string): Promise<void> => {
  await apiClient.post('accounts/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('accounts/dashboard-stats/');
  return response.data;
};
