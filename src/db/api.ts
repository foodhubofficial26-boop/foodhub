import { supabase } from './supabase';
import type { Profile, Category, Restaurant, FoodItem, Order, OrderItem, Address, DashboardStats, OrderStatus } from '@/types/types';

// ============ Categories ============
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createCategory(category: { name: string; description?: string; image_url?: string }): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============ Restaurants ============
export async function getRestaurants(filters?: {
  search?: string;
  category?: string;
  is_veg?: boolean;
  min_rating?: number;
}): Promise<Restaurant[]> {
  let query = supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters?.is_veg !== undefined) {
    query = query.eq('is_veg', filters.is_veg);
  }

  if (filters?.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function createRestaurant(restaurant: Partial<Restaurant>): Promise<Restaurant> {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteRestaurant(id: string): Promise<void> {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============ Food Items ============
export async function getFoodItemsByRestaurant(restaurantId: string, filters?: {
  category?: string;
  is_veg?: boolean;
  search?: string;
}): Promise<FoodItem[]> {
  let query = supabase
    .from('food_items')
    .select('*, restaurant:restaurants(*), category:categories(*)')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('name');

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters?.is_veg !== undefined) {
    query = query.eq('is_veg', filters.is_veg);
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAllFoodItems(filters?: {
  search?: string;
  category?: string;
  is_veg?: boolean;
}): Promise<FoodItem[]> {
  let query = supabase
    .from('food_items')
    .select('*, restaurant:restaurants(*), category:categories(*)')
    .eq('is_available', true)
    .order('name')
    .limit(50);

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  if (filters?.is_veg !== undefined) {
    query = query.eq('is_veg', filters.is_veg);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getFoodItemById(id: string): Promise<FoodItem | null> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*, restaurant:restaurants(*), category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function createFoodItem(foodItem: Partial<FoodItem>): Promise<FoodItem> {
  const { data, error } = await supabase
    .from('food_items')
    .insert(foodItem)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
  const { data, error } = await supabase
    .from('food_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteFoodItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('food_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============ Addresses ============
export async function getUserAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createAddress(address: Partial<Address>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .insert(address)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
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
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.user_id,
      restaurant_id: order.restaurant_id,
      address_id: order.address_id || null,
      total_amount: order.total_amount,
      delivery_address: order.delivery_address,
      status: 'pending'
    })
    .select()
    .single();
  
  if (orderError) throw orderError;

  const orderItems = order.items.map(item => ({
    order_id: orderData.id,
    food_item_id: item.food_item_id,
    food_name: item.food_name,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) throw itemsError;

  return orderData;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, restaurant:restaurants(*), order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, restaurant:restaurants(*), order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, restaurant:restaurants(*), order_items(*)')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============ Profiles ============
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============ Dashboard Stats ============
export async function getDashboardStats(): Promise<DashboardStats> {
  const [ordersResult, usersResult, foodItemsResult] = await Promise.all([
    supabase.from('orders').select('total_amount', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('food_items').select('id', { count: 'exact' })
  ]);

  const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

  return {
    total_orders: ordersResult.count || 0,
    total_revenue: totalRevenue,
    total_users: usersResult.count || 0,
    total_food_items: foodItemsResult.count || 0
  };
}
