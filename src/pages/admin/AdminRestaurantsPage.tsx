import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '@/db/api';
import type { Restaurant } from '@/types/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import { supabase } from '@/db/supabase';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const dropzoneProps = useSupabaseUpload({ bucketName: 'app-a04i0mry03k1_food_images', supabase });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    address: '',
    phone: '',
    rating: '0',
    is_veg: false,
    is_active: true
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (dropzoneProps.files.length === 0) return;
    await dropzoneProps.onUpload();
    
    // Get the uploaded file URL from successes
    if (dropzoneProps.successes.length > 0) {
      const fileName = dropzoneProps.successes[0];
      const { data } = supabase.storage
        .from('app-a04i0mry03k1_food_images')
        .getPublicUrl(fileName);
      setFormData({ ...formData, image_url: data.publicUrl });
      toast.success('Image uploaded successfully');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        address: formData.address,
        phone: formData.phone || null,
        rating: Number(formData.rating),
        is_veg: formData.is_veg,
        is_active: formData.is_active
      };

      if (editingRestaurant) {
        await updateRestaurant(editingRestaurant.id, data);
        toast.success('Restaurant updated');
      } else {
        await createRestaurant(data);
        toast.success('Restaurant created');
      }

      setDialogOpen(false);
      resetForm();
      loadRestaurants();
    } catch (error) {
      console.error('Failed to save restaurant:', error);
      toast.error('Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || '',
      image_url: restaurant.image_url || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      rating: restaurant.rating.toString(),
      is_veg: restaurant.is_veg,
      is_active: restaurant.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? All associated food items will also be deleted.')) return;
    try {
      await deleteRestaurant(id);
      toast.success('Restaurant deleted');
      loadRestaurants();
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      address: '',
      phone: '',
      rating: '0',
      is_veg: false,
      is_active: true
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRestaurant ? 'Edit' : 'Add'} Restaurant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <Dropzone {...dropzoneProps}>
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                  {dropzoneProps.isSuccess && (
                    <Button onClick={handleImageUpload} className="mt-2 w-full" variant="outline">
                      Use Uploaded Image
                    </Button>
                  )}
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_veg">Vegetarian Only</Label>
                  <Switch
                    id="is_veg"
                    checked={formData.is_veg}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_veg: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={dropzoneProps.loading}>
                  {dropzoneProps.loading ? 'Uploading...' : editingRestaurant ? 'Update' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Skeleton className="h-96 bg-muted" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell>
                        <img src={restaurant.image_url || ''} alt={restaurant.name} className="h-12 w-12 object-cover rounded" />
                      </TableCell>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.address}</TableCell>
                      <TableCell>{restaurant.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span>{restaurant.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={restaurant.is_veg ? 'secondary' : 'outline'}>
                          {restaurant.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                          {restaurant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(restaurant)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(restaurant.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
