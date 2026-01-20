-- Create 'product-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Remove existing policies to avoid conflicts during retry
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Product Images" ON storage.objects;

-- 1. Allow Public Read Access (View images)
CREATE POLICY "Public Access Product Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- 2. Allow Authenticated Upload (Admins)
CREATE POLICY "Auth Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- 3. Allow Authenticated Update (Admins)
CREATE POLICY "Auth Update Product Images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- 4. Allow Authenticated Delete (Admins)
CREATE POLICY "Auth Delete Product Images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
