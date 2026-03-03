import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Phone, Plus, Minus } from 'lucide-react';
import { getRestaurantById, getFoodItemsByRestaurant, getCategories } from '@/db/api';
import type { Restaurant, FoodItem, Category, CartItem } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function RestaurantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadFoodItems();
    }
  }, [id, categoryFilter, vegFilter]);

  const loadData = async () => {
    try {
      const [restaurantData, categoriesData] = await Promise.all([
        getRestaurantById(id!),
        getCategories()
      ]);
      setRestaurant(restaurantData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const loadFoodItems = async () => {
    try {
      const filters: { category?: string; is_veg?: boolean } = {};
      if (categoryFilter && categoryFilter !== 'all') filters.category = categoryFilter;
      if (vegFilter === 'true') filters.is_veg = true;
      if (vegFilter === 'false') filters.is_veg = false;

      const data = await getFoodItemsByRestaurant(id!, filters);
      setFoodItems(data);
    } catch (error) {
      console.error('Failed to load food items:', error);
    }
  };

  const addToCart = (foodItem: FoodItem) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.food_item.id === foodItem.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ food_item: foodItem, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${foodItem.name} added to cart`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-64 w-full mb-8 bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!restaurant) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Restaurant not found</p>
          <Button onClick={() => navigate('/restaurants')} className="mt-4">
            Back to Restaurants
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Restaurant Header */}
      <div className="bg-muted/50">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <img
                src={restaurant.image_url || ''}
                alt={restaurant.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
                <Badge variant={restaurant.is_veg ? 'secondary' : 'outline'} className="text-lg px-3 py-1">
                  {restaurant.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                </Badge>
              </div>
              <p className="text-muted-foreground">{restaurant.description}</p>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="font-bold text-lg">{restaurant.rating}</span>
              </div>
              <div className="space-y-2">
                {restaurant.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Menu</h2>
          <div className="flex gap-4">
            <Select value={categoryFilter || 'all'} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vegFilter || 'all'} onValueChange={(value) => setVegFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Veg Only</SelectItem>
                <SelectItem value="false">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {foodItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image_url || ''}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold">{item.name}</h3>
                    <Badge variant={item.is_veg ? 'secondary' : 'outline'} className="shrink-0">
                      {item.is_veg ? '🌱' : '🍖'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                    <Button onClick={() => addToCart(item)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
