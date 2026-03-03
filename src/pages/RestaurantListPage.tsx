import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Filter } from 'lucide-react';
import { getRestaurants, getCategories } from '@/db/api';
import type { Restaurant, Category } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const [vegFilter, setVegFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    const veg = searchParams.get('veg') || 'all';
    const rating = searchParams.get('rating') || 'all';
    setVegFilter(veg);
    setRatingFilter(rating);
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [search, vegFilter, ratingFilter]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const filters: {
        search?: string;
        is_veg?: boolean;
        min_rating?: number;
      } = {};

      if (search) filters.search = search;
      if (vegFilter === 'true') filters.is_veg = true;
      if (vegFilter === 'false') filters.is_veg = false;
      if (ratingFilter && ratingFilter !== 'all') filters.min_rating = Number(ratingFilter);

      const data = await getRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Restaurants</h1>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="flex-1"
            />
            <Button onClick={loadRestaurants}>
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={vegFilter} onValueChange={(value) => updateFilter('veg', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Vegetarian</SelectItem>
                <SelectItem value="false">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={(value) => updateFilter('rating', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>

            {(search || vegFilter || ratingFilter) && (
              <Button variant="outline" onClick={() => setSearchParams({})}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
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
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
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
                      {restaurant.is_veg ? '🌱' : '🍖'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {restaurant.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{restaurant.address}</p>
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
