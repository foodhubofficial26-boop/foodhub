import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserOrders } from '@/db/api';
import type { Order } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning' },
  preparing: { label: 'Preparing', color: 'bg-info/10 text-info' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-primary/10 text-primary' },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive' }
};

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await getUserOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return ['pending', 'preparing', 'out_for_delivery'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['delivered', 'cancelled'].includes(order.status);
    }
    return true;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-12 w-48 mb-8 bg-muted" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No orders found</h2>
                <p className="text-muted-foreground mb-6">
                  {filter === 'active' ? "You don't have any active orders" : "You haven't placed any orders yet"}
                </p>
                <Button onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = statusConfig[order.status];
                  return (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{order.restaurant?.name || 'Restaurant'}</h3>
                            <p className="text-sm text-muted-foreground">
                              Order ID: {order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.order_items?.slice(0, 3).map((item) => (
                            <p key={item.id} className="text-sm">
                              {item.food_name} x{item.quantity}
                            </p>
                          ))}
                          {order.order_items && order.order_items.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.order_items.length - 3} more items
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="font-bold text-lg text-primary">
                            ${order.total_amount.toFixed(2)}
                          </span>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
