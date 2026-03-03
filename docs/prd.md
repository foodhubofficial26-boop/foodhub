# Food Ordering System Requirements Document

## 1. Application Overview

### 1.1 Application Name
Food Ordering System

### 1.2 Application Description
A complete food ordering platform similar to Swiggy/Zomato, featuring separate client-side and admin-side interfaces. The system enables users to browse restaurants, order food, track deliveries, and manage their profiles, while administrators can manage food items, categories, orders, users, and restaurants.

## 2. Application Features

### 2.1 Client Side (User App)

#### 2.1.1 Authentication
- User login and signup
- JWT-based authentication
- Protected routes for authenticated users

#### 2.1.2 Home Page
- Search bar for restaurants and food items
- Categories display
- Featured restaurants section

#### 2.1.3 Restaurant List Page
- Filter options: rating, category, veg/non-veg, price
- Search functionality

#### 2.1.4 Restaurant Details Page
- Restaurant information display
- Food items listing with image, name, and price
- Add to cart functionality

#### 2.1.5 Cart Page
- Add/remove items
- Quantity adjustment
- Total price calculation

#### 2.1.6 Checkout Page
- Delivery address form
- Cash on Delivery (COD) payment option
- Order summary
- Place order functionality

#### 2.1.7 Order Tracking Page
- Real-time order status: Pending → Preparing → Out for Delivery → Delivered

#### 2.1.8 Order History Page
- Display past orders
- Reorder option

#### 2.1.9 Profile Page
- Update user profile
- Manage saved addresses
- Logout functionality

### 2.2 Admin Side

#### 2.2.1 Admin Login
- Secure admin authentication

#### 2.2.2 Dashboard
- Display total orders
- Display total revenue
- Display total users
- Display total food items

#### 2.2.3 Food Management
- Add new food item
- Edit existing food item
- Delete food item
- Toggle item availability

#### 2.2.4 Category Management
- Add new categories
- Remove categories

#### 2.2.5 Restaurant Management
- Add new restaurant
- Remove restaurant

#### 2.2.6 Orders Management
- View all orders
- View order details
- Update order status: Pending / Preparing / Out for Delivery / Delivered

#### 2.2.7 Users Management
- View all registered users

## 3. Technical Requirements

### 3.1 Backend
- Node.js with Express framework
- MongoDB database with Mongoose ODM
- Data models: User, FoodItem, Category, Order, Restaurant
- API routes structure:
  - /auth/* for authentication
  - /food/* for food items
  - /orders/* for order management
  - /categories/* for category management
  - /restaurants/* for restaurant management
  - /admin/* for admin operations
- JWT authentication middleware
- Password hashing for security
- Image upload support

### 3.2 Frontend
- Clean and responsive UI design
- Reusable components architecture
- Separation between admin and user interfaces

### 3.3 Core Functionality
- Full CRUD operations
- Cart logic implementation
- Complete order lifecycle management
- Clean API structure
- Role-based access control