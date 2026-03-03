-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-a04i0mry03k1_food_images',
  'app-a04i0mry03k1_food_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
);

-- Create storage policies
CREATE POLICY "Anyone can view food images" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-a04i0mry03k1_food_images');

CREATE POLICY "Authenticated users can upload food images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'app-a04i0mry03k1_food_images');

CREATE POLICY "Admins can delete food images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'app-a04i0mry03k1_food_images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'::public.user_role)
  );