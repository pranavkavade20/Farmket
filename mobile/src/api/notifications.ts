import { apiClient } from './client';

export interface Notification {
  id: number;
  user: number;
  notification_type: 'ORDER' | 'RESERVATION' | 'STAGE_UPDATE' | 'PRICE_ALERT' | 'SYSTEM' | string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[] | { results: Notification[] }>('notifications/');
  if (Array.isArray(response.data)) return response.data;
  return response.data.results || [];
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.post('notifications/mark_all_read/');
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await apiClient.patch(`notifications/${id}/`, { is_read: true });
};
