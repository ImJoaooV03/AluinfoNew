/*
  # Fix Media Kit Settings RLS and Schema

  ## Query Description:
  1. Ensures `media_kit_settings` table exists with correct structure and `region` as unique constraint.
  2. Enables RLS.
  3. Adds policies for Public Read and Admin Write access.
  4. Ensures `media-kits` storage bucket exists and has correct policies.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Table Setup: Ensure table exists and has unique constraint on region
CREATE TABLE IF NOT EXISTS public.media_kit_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Safely add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'media_kit_settings_region_key'
    ) THEN
        ALTER TABLE public.media_kit_settings ADD CONSTRAINT media_kit_settings_region_key UNIQUE (region);
    END IF;
END $$;

-- 2. RLS Setup
ALTER TABLE public.media_kit_settings ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Media Kit Settings" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Admin Manage Media Kit Settings" ON public.media_kit_settings;

-- Policy: Anyone can read (needed for public pages to show the download link)
CREATE POLICY "Public Read Media Kit Settings"
ON public.media_kit_settings FOR SELECT
USING (true);

-- Policy: Authenticated users (admins) can do everything (Insert, Update, Delete)
CREATE POLICY "Admin Manage Media Kit Settings"
ON public.media_kit_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Storage Bucket Setup (Just in case it wasn't created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-kits', 'media-kits', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access Media Kits" ON storage.objects;
CREATE POLICY "Public Access Media Kits"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media-kits' );

DROP POLICY IF EXISTS "Auth Upload Media Kits" ON storage.objects;
CREATE POLICY "Auth Upload Media Kits"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Delete Media Kits" ON storage.objects;
CREATE POLICY "Auth Delete Media Kits"
ON storage.objects FOR DELETE
USING ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Update Media Kits" ON storage.objects;
CREATE POLICY "Auth Update Media Kits"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );
