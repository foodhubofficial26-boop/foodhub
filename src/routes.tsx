import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminFoodPage from './pages/admin/AdminFoodPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import NotFound from './pages/NotFound';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />
  },
  {
    name: 'Restaurants',
    path: '/restaurants',
    element: <RestaurantListPage />
  },
  {
    name: 'Restaurant Details',
    path: '/restaurants/:id',
    element: <RestaurantDetailsPage />
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <CartPage />
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <CheckoutPage />
  },
  {
    name: 'Order Tracking',
    path: '/orders/:id',
    element: <OrderTrackingPage />
  },
  {
    name: 'Order History',
    path: '/orders',
    element: <OrderHistoryPage />
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboardPage />
  },
  {
    name: 'Admin Restaurants',
    path: '/admin/restaurants',
    element: <AdminRestaurantsPage />
  },
  {
    name: 'Admin Food',
    path: '/admin/food',
    element: <AdminFoodPage />
  },
  {
    name: 'Admin Categories',
    path: '/admin/categories',
    element: <AdminCategoriesPage />
  },
  {
    name: 'Admin Orders',
    path: '/admin/orders',
    element: <AdminOrdersPage />
  },
  {
    name: 'Admin Users',
    path: '/admin/users',
    element: <AdminUsersPage />
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />
  }
];

export default routes;
