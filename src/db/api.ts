import axios from 'axios';
import { setAuthHeaders } from '@/contexts/AuthContext';
import type { Profile, Category, Restaurant, FoodItem, Order, Address, DashboardStats, OrderStatus } from '@/types/types';

const API_URL = import.meta.env.VITE_API_URL || '';

function api() {
  setAuthHeaders();
  return axios;
}

// ============ Categories ============
export async function getCategories(): Promise<Category[]> {
  const { data } = await api().get(`${API_URL}/api/categories`);
  return Array.isArray(data) ? data : [];
}

export async function createCategory(category: { name: string; description?: string; image_url?: string }): Promise<Category> {
  const { data } = await api().post(`${API_URL}/api/categories`, {
    name: category.name,
    description: category.description,
    imageUrl: category.image_url,
  });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api().delete(`${API_URL}/api/categories/${id}`);
}

// ============ Restaurants ============
export async function getRestaurants(filters?: {
  search?: string;
  category?: string;
  is_veg?: boolean;
  min_rating?: number;
}): Promise<Restaurant[]> {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.category) params.category = filters.category;
  if (filters?.is_veg !== undefined) params.is_veg = String(filters.is_veg);
  if (filters?.min_rating) params.min_rating = String(filters.min_rating);

  const { data } = await api().get(`${API_URL}/api/restaurants`, { params });
  return Array.isArray(data) ? data : [];
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const { data } = await api().get(`${API_URL}/api/restaurants/${id}`);
    return data;
  } catch {
    return null;
  }
}

export async function createRestaurant(restaurant: Partial<Restaurant>): Promise<Restaurant> {
  const { data } = await api().post(`${API_URL}/api/restaurants`, restaurant);
  return data;
}

export async function updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
  const { data } = await api().put(`${API_URL}/api/restaurants/${id}`, updates);
  return data;
}

export async function deleteRestaurant(id: string): Promise<void> {
  await api().delete(`${API_URL}/api/restaurants/${id}`);
}

// ============ Food Items ============
export async function getFoodItemsByRestaurant(restaurantId: string, filters?: {
  category?: string;
  is_veg?: boolean;
  search?: string;
}): Promise<FoodItem[]> {
  const params: Record<string, string> = { restaurant_id: restaurantId };
  if (filters?.category) params.category = filters.category;
  if (filters?.is_veg !== undefined) params.is_veg = String(filters.is_veg);
  if (filters?.search) params.search = filters.search;

  const { data } = await api().get(`${API_URL}/api/food`, { params });
  return Array.isArray(data) ? data : [];
}

export async function getAllFoodItems(filters?: {
  search?: string;
  category?: string;
  is_veg?: boolean;
}): Promise<FoodItem[]> {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.category) params.category = filters.category;
  if (filters?.is_veg !== undefined) params.is_veg = String(filters.is_veg);

  const { data } = await api().get(`${API_URL}/api/food`, { params });
  return Array.isArray(data) ? data : [];
}

export async function getFoodItemById(id: string): Promise<FoodItem | null> {
  try {
    const { data } = await api().get(`${API_URL}/api/food/${id}`);
    return data;
  } catch {
    return null;
  }
}

export async function createFoodItem(foodItem: Partial<FoodItem>): Promise<FoodItem> {
  const { data } = await api().post(`${API_URL}/api/food`, foodItem);
  return data;
}

export async function updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
  const { data } = await api().put(`${API_URL}/api/food/${id}`, updates);
  return data;
}

export async function deleteFoodItem(id: string): Promise<void> {
  await api().delete(`${API_URL}/api/food/${id}`);
}

// ============ Addresses ============
export async function getUserAddresses(userId: string): Promise<Address[]> {
  const { data } = await api().get(`${API_URL}/api/addresses`, { params: { user_id: userId } });
  return Array.isArray(data) ? data : [];
}

export async function createAddress(address: Partial<Address>): Promise<Address> {
  const { data } = await api().post(`${API_URL}/api/addresses`, address);
  return data;
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  const { data } = await api().put(`${API_URL}/api/addresses/${id}`, updates);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api().delete(`${API_URL}/api/addresses/${id}`);
}

// ============ Orders ============
export async function createOrder(order: {
  user_id: string;
  restaurant_id: string;
  address_id?: string;
  total_amount: number;
  delivery_address: string;
  items: { food_item_id: string; food_name: string; quantity: number; price: number }[];
}): Promise<Order> {
  const { data } = await api().post(`${API_URL}/api/orders`, order);
  return data;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data } = await api().get(`${API_URL}/api/orders`, { params: { user_id: userId } });
  return Array.isArray(data) ? data : [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data } = await api().get(`${API_URL}/api/orders/${orderId}`);
    return data;
  } catch {
    return null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await api().get(`${API_URL}/api/orders`);
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data } = await api().put(`${API_URL}/api/orders/${orderId}/status`, { status });
  return data;
}

// ============ Profiles ============
export async function getProfile(_userId: string): Promise<Profile | null> {
  // Use /api/auth/me to get the current user's profile
  try {
    const { data } = await api().get(`${API_URL}/api/auth/me`);
    return data;
  } catch {
    return null;
  }
}

export async function updateProfile(_userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data } = await api().put(`${API_URL}/api/users/profile`, updates);
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data } = await api().get(`${API_URL}/api/users`);
  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<Profile> {
  const { data } = await api().put(`${API_URL}/api/users/${userId}/role`, { role });
  return data;
}

// ============ Dashboard Stats ============
export async function getDashboardStats(): Promise<DashboardStats> {
  const [ordersRes, usersRes, foodRes] = await Promise.all([
    api().get(`${API_URL}/api/orders`),
    api().get(`${API_URL}/api/users`),
    api().get(`${API_URL}/api/food`),
  ]);

  const orders: Order[] = Array.isArray(ordersRes.data) ? ordersRes.data : [];
  const users: Profile[] = Array.isArray(usersRes.data) ? usersRes.data : [];
  const foodItems: FoodItem[] = Array.isArray(foodRes.data) ? foodRes.data : [];

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

  return {
    total_orders: orders.length,
    total_revenue: totalRevenue,
    total_users: users.length,
    total_food_items: foodItems.length,
  };
}
