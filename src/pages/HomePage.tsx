import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star } from 'lucide-react';
import { getCategories, getRestaurants } from '@/db/api';
import type { Category, Restaurant } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, restaurantsData] = await Promise.all([
        getCategories(),
        getRestaurants()
      ]);
      setCategories(categoriesData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/restaurants?search=${encodeURIComponent(search)}`);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Delicious Food, <span className="text-primary">Delivered Fast</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Order from your favorite restaurants and get it delivered to your doorstep
            </p>
            <div className="flex gap-2 max-w-xl mx-auto">
              <Input
                placeholder="Search for restaurants or food..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12"
              />
              <Button onClick={handleSearch} size="lg">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/restaurants?category=${category.id}`)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      <img
                        src={category.image_url || ''}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-medium text-sm">{category.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Featured Restaurants</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={restaurant.image_url || ''}
                      alt={restaurant.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <Badge variant={restaurant.is_veg ? 'secondary' : 'outline'}>
                        {restaurant.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/restaurants')} size="lg">
              View All Restaurants
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Browse</h3>
              <p className="text-muted-foreground">
                Explore restaurants and discover delicious food options
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Order</h3>
              <p className="text-muted-foreground">
                Add items to cart and place your order with ease
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Enjoy</h3>
              <p className="text-muted-foreground">
                Get your food delivered fresh and hot to your door
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
