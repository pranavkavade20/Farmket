import api from '@/lib/api';

export interface AdminKPIs {
  total_farmers: number;
  total_buyers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  new_farmers_month: number;
  new_buyers_month: number;
  new_products_month: number;
  active_users: number;
}

export interface TrendPoint {
  date: string;
  revenue?: number;
  farmers?: number;
  buyers?: number;
}

export interface AdminExecutiveData {
  kpis: AdminKPIs;
  revenue_trend: TrendPoint[];
  user_trend: TrendPoint[];
}

export interface UserGrowthData {
  month: string;
  farmer: number;
  buyer: number;
}

export interface AdminUserData {
  user_growth: UserGrowthData[];
  total_farmers?: number;
  total_buyers?: number;
  new_farmers_month?: number;
  new_buyers_month?: number;
  active_users?: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
}

export interface AdminMarketplaceData {
  order_status: OrderStatusData[];
  top_categories: CategoryData[];
  total_orders?: number;
  delivered_orders?: number;
  pending_orders?: number;
  total_revenue?: number;
}

export interface TopCropData {
  name: string;
  count: number;
}

export interface HarvestData {
  id?: number;
  product: string;
  farmer: string;
  expected_date: string;
  stage?: string;
  expected_quantity?: number;
  available_quantity?: number;
  organic?: boolean;
}

export interface AdminCropData {
  top_crops: TopCropData[];
  upcoming_harvests: HarvestData[];
  total_tracked_crops?: number;
}

export const adminAnalyticsService = {
  getExecutiveOverview: async (): Promise<AdminExecutiveData> => {
    const res = await api.get<AdminExecutiveData>('/analytics/admin/executive/');
    return res.data;
  },

  getUserAnalytics: async (): Promise<AdminUserData> => {
    const res = await api.get<AdminUserData>('/analytics/admin/users/');
    return res.data;
  },

  getMarketplaceAnalytics: async (): Promise<AdminMarketplaceData> => {
    const res = await api.get<AdminMarketplaceData>('/analytics/admin/marketplace/');
    return res.data;
  },

  getCropAnalytics: async (): Promise<AdminCropData> => {
    const res = await api.get<AdminCropData>('/analytics/admin/crops/');
    return res.data;
  },

  exportReport: async (type: string) => {
    const res = await api.get(`/analytics/admin/export/?type=${type}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
