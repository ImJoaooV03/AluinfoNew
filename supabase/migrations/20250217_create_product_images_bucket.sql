-- Create 'product-images' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated upload
DROP POLICY IF EXISTS "Auth Upload Product Images" ON storage.objects;
CREATE POLICY "Auth Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated update
DROP POLICY IF EXISTS "Auth Update Product Images" ON storage.objects;
CREATE POLICY "Auth Update Product Images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated delete
DROP POLICY IF EXISTS "Auth Delete Product Images" ON storage.objects;
CREATE POLICY "Auth Delete Product Images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
