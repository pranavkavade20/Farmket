// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserType = 'farmer' | 'buyer' | 'admin';

/** Shape returned by GET /api/v1/accounts/me/ and embedded in auth responses */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'male' | 'female' | 'others' | '';
  /** Django field is user_type (not role) */
  user_type: UserType;
  phone_number: string;
  address: string;
  profile_picture: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  user_type: UserType;
  phone_number?: string;
  gender?: User['gender'];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface Review {
  id: number;
  buyer: number;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Product {
  id: number;
  farmer: number;
  farmer_name: string;
  category: number | null;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  price: string;          // Django DecimalField serialises as string
  unit: 'kg' | 'g' | 'l' | 'unit' | 'dozen';
  stock_quantity: number;
  minimum_order: number;
  is_organic: boolean;
  harvest_date: string | null;
  is_available: boolean;
  in_stock: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  reviews: Review[];
  // Market State & Prebooking fields
  market_state: 'UPCOMING' | 'GROWING' | 'READY_FOR_PREBOOKING' | 'READY_TO_HARVEST' | 'AVAILABLE_NOW' | 'LOW_STOCK' | 'SOLD_OUT';
  stage: string | null;
  progress: number;
  crop_stage?: string;
  progress_percentage?: number;
  harvest_countdown: number;
  reservation_count: number;
  reserved_quantity: number;
  available_quantity: number;
  is_prebookable: boolean;
  is_following: boolean;
  active_crop_growth_id: number | null;
}

export interface ProductFilters {
  category__slug?: string;
  is_organic?: boolean;
  is_available?: boolean;
  search?: string;
  ordering?: 'price' | '-price' | 'created_at' | '-created_at' | 'views' | '-views';
  page?: number;
  farmer?: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface BuyerDetails {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number?: string;
  profile_picture?: string | null;
  address?: string;
  company_name?: string | null;
}

export interface OrderStatusHistoryItem {
  id: number;
  previous_status: string;
  new_status: string;
  timestamp: string;
  updated_by?: number | null;
  updated_by_name?: string;
}

export interface OrderItemCropGrowth {
  id: number;
  current_stage: string;
  expected_harvest_date?: string | null;
  sow_date?: string | null;
}

export interface OrderItem {
  id: number;
  order?: number;
  product: number;
  product_name: string;
  product_details?: Partial<Product>;
  farmer?: number;
  quantity: number;
  price: string;
  price_at_purchase: string; // alias for price, returned by backend serializer
  status: string;
  subtotal: number;
  is_prebooking?: boolean;
  crop_growth?: number | null;
  crop_growth_details?: OrderItemCropGrowth | null;
  status_history?: OrderStatusHistoryItem[];
}

export interface Order {
  id: number;
  order_number?: string;
  buyer: number;
  buyer_details?: BuyerDetails | null;
  items: OrderItem[];
  status: OrderStatus;
  total_amount: string;
  delivery_address: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  total_revenue?: number;
  total_products?: number;
}


// ─── Social Feed ──────────────────────────────────────────────────────────────

export interface PostMedia {
  id: number;
  type: 'image' | 'video';
  file: string;
}

export interface Post {
  id: number;
  farmer: Partial<User>;
  title: string;
  description: string;
  location: string;
  is_pinned: boolean;
  created_at: string;
  hashtags: string[];
  media: PostMedia[];
  product?: Product;
  is_liked: boolean;
  likes_count: number;
  is_saved: boolean;
  comments_count: number;
}
