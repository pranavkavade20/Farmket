import api from './api';

export interface FarmerAnalyticsKPIs {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  active_products: number;
  total_views: number;
  avg_rating: number;
  total_reviews: number;
}

export interface TrendPoint {
  month: string;
  revenue?: number;
  orders?: number;
  spent?: number;
}

export interface TopProduct {
  name: string;
  views: number;
  price: string;
  stock_quantity: number;
  is_available: boolean;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  created_at: string;
}

export interface FarmerAnalyticsData {
  kpis: FarmerAnalyticsKPIs;
  revenue_trend: TrendPoint[];
  orders_trend: TrendPoint[];
  top_products: TopProduct[];
  category_distribution: CategoryData[];
  recent_orders: RecentOrder[];
}

export interface BuyerAnalyticsData {
  kpis: {
    total_orders: number;
    pending_orders: number;
    total_spent: number;
  };
  spend_trend: TrendPoint[];
}

export const analyticsService = {
  getFarmerAnalytics: async (): Promise<FarmerAnalyticsData> => {
    const res = await api.get<FarmerAnalyticsData>('/analytics/farmer/');
    return res.data;
  },

  getBuyerAnalytics: async (): Promise<BuyerAnalyticsData> => {
    const res = await api.get<BuyerAnalyticsData>('/analytics/buyer/');
    return res.data;
  },
};
