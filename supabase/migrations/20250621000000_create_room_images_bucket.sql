
-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-images',
  'room-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create storage policy for room images
CREATE POLICY "Anyone can view room images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

CREATE POLICY "Anyone can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'room-images');

CREATE POLICY "Anyone can update room images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'room-images');

CREATE POLICY "Anyone can delete room images"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-images');
