import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/db/api';
import type { Order } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, Truck, Package } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-warning/10 text-warning' },
  preparing: { label: 'Preparing', icon: Package, color: 'bg-info/10 text-info' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'bg-primary/10 text-primary' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', icon: Clock, color: 'bg-destructive/10 text-destructive' }
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      loadOrder();
      const interval = setInterval(loadOrder, 5000);
      return () => clearInterval(interval);
    }
  }, [id, user]);

  const loadOrder = async () => {
    try {
      const data = await getOrderById(id!);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-64 w-full bg-muted" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            View All Orders
          </Button>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  const statuses: Array<keyof typeof statusConfig> = ['pending', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Order Tracking</h1>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
                <div
                  className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {statuses.map((status, index) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    const isCompleted = index <= currentStatusIndex;
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                            isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs text-center max-w-[80px]">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-medium">{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Restaurant</p>
                  <p className="font-medium">{order.restaurant?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-primary">${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Delivery Address</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.food_name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => navigate('/orders')} variant="outline" className="flex-1">
              View All Orders
            </Button>
            <Button onClick={() => navigate('/restaurants')} className="flex-1">
              Order Again
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
