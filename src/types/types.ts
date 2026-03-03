export type UserRole = 'user' | 'admin';

export type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  email: string | null;
  username: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  address: string | null;
  phone: string | null;
  rating: number;
  is_veg: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  category?: Category;
}

export interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string | null;
  address_id: string | null;
  total_amount: number;
  status: OrderStatus;
  delivery_address: string;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string | null;
  food_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface CartItem {
  food_item: FoodItem;
  quantity: number;
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_users: number;
  total_food_items: number;
}
