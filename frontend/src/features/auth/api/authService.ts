import api from '@/lib/api';
import type { AuthResponse, LoginCredentials, RegisterData, User, DashboardStats } from '@/types';

export interface PasswordResetConfirmPayload {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangeEmailPayload {
  new_email: string;
  password: string;
}

export const authService = {
  /** POST /accounts/login/ — returns JWT tokens + user */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ access: string; refresh: string; user?: User }>(
      '/accounts/login/',
      { email: credentials.email, password: credentials.password }
    );

    let userData = response.data.user;
    if (!userData) {
      const meResponse = await api.get<User>('/accounts/me/', {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });
      userData = meResponse.data;
    }

    return {
      token: response.data.access,
      refresh_token: response.data.refresh,
      user: userData,
    };
  },

  /** POST /accounts/register/ */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/accounts/register/', data);
    return response.data;
  },

  /** POST /accounts/logout/ — blacklists caller refresh token */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/accounts/logout/', { refresh_token: refreshToken });
  },

  /** POST /accounts/logout-all/ — revokes all active sessions across all devices */
  logoutAll: async (): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/logout-all/');
    return response.data;
  },

  /** POST /accounts/password-reset/ — request reset email */
  requestPasswordReset: async (email: string): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/password-reset/', { email });
    return response.data;
  },

  /** POST /accounts/password-reset-confirm/ — confirm password reset */
  confirmPasswordReset: async (payload: PasswordResetConfirmPayload): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/password-reset-confirm/', payload);
    return response.data;
  },

  /** POST /accounts/change-password/ — authenticated password change */
  changePassword: async (payload: ChangePasswordPayload): Promise<{ detail: string; access?: string; refresh?: string }> => {
    const response = await api.post<{ detail: string; access?: string; refresh?: string }>(
      '/accounts/change-password/',
      payload
    );
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
    }
    return response.data;
  },

  /** POST /accounts/verify-email/ — verify email address */
  verifyEmail: async (token: string): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/verify-email/', { token });
    return response.data;
  },

  /** POST /accounts/resend-verification/ — resend verification email */
  resendVerification: async (email: string): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/resend-verification/', { email });
    return response.data;
  },

  /** POST /accounts/change-email/ — request email change */
  requestEmailChange: async (payload: ChangeEmailPayload): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/change-email/', payload);
    return response.data;
  },

  /** POST /accounts/verify-email-change/ — confirm email change */
  verifyEmailChange: async (token: string): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>('/accounts/verify-email-change/', { token });
    return response.data;
  },

  /** GET /accounts/me/ */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/accounts/me/');
    return response.data;
  },

  /** PATCH /accounts/me/ */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/accounts/me/', data);
    return response.data;
  },

  /** GET /accounts/dashboard-stats/ */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/accounts/dashboard-stats/');
    return response.data;
  },
};
