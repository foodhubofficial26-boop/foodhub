import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllFoodItems, getCategories, getRestaurants, createFoodItem, updateFoodItem, deleteFoodItem } from '@/db/api';
import type { FoodItem, Category, Restaurant } from '@/types/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone';
import { supabase } from '@/db/supabase';

export default function AdminFoodPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const { uploadFile, uploading, onUpload, ...dropzoneProps } = useSupabaseUpload({ bucketName: 'app-a04i0mry03k1_food_images', supabase });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    restaurant_id: '',
    category_id: '',
    image_url: '',
    is_veg: true,
    is_available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foodData, categoriesData, restaurantsData] = await Promise.all([
        getAllFoodItems(),
        getCategories(),
        getRestaurants()
      ]);
      setFoodItems(foodData);
      setCategories(categoriesData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (dropzoneProps.files.length === 0) return;
    await onUpload();
    if (dropzoneProps.files[0]) {
      const file = dropzoneProps.files[0];
      const fileName = `${Date.now()}_${file.name}`;
      const { data } = supabase.storage
        .from('app-a04i0mry03k1_food_images')
        .getPublicUrl(fileName);
      setFormData({ ...formData, image_url: data.publicUrl });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.restaurant_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        price: Number(formData.price),
        restaurant_id: formData.restaurant_id,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        is_veg: formData.is_veg,
        is_available: formData.is_available
      };

      if (editingItem) {
        await updateFoodItem(editingItem.id, data);
        toast.success('Food item updated');
      } else {
        await createFoodItem(data);
        toast.success('Food item created');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save food item:', error);
      toast.error('Failed to save food item');
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      restaurant_id: item.restaurant_id,
      category_id: item.category_id || '',
      image_url: item.image_url || '',
      is_veg: item.is_veg,
      is_available: item.is_available
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteFoodItem(id);
      toast.success('Food item deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete food item:', error);
      toast.error('Failed to delete food item');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      restaurant_id: '',
      category_id: '',
      image_url: '',
      is_veg: true,
      is_available: true
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Food Items</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Food Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add'} Food Item</DialogTitle>
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
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant">Restaurant *</Label>
                    <Select value={formData.restaurant_id} onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Image</Label>
                  <Dropzone {...dropzoneProps}>
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_veg">Vegetarian</Label>
                  <Switch
                    id="is_veg"
                    checked={formData.is_veg}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_veg: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_available">Available</Label>
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
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
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img src={item.image_url || ''} alt={item.name} className="h-12 w-12 object-cover rounded" />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.restaurant?.name}</TableCell>
                      <TableCell>{item.category?.name || 'N/A'}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_veg ? 'secondary' : 'outline'}>
                          {item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_available ? 'default' : 'secondary'}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
