-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region TEXT NOT NULL UNIQUE, -- 'pt', 'mx', 'en'
    logo_url TEXT,
    site_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
CREATE POLICY "Public read access"
ON public.site_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin write access" ON public.site_settings;
CREATE POLICY "Admin write access"
ON public.site_settings FOR ALL
USING (auth.role() = 'authenticated');

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access Site Assets" ON storage.objects;
CREATE POLICY "Public Access Site Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

DROP POLICY IF EXISTS "Auth Upload Site Assets" ON storage.objects;
CREATE POLICY "Auth Upload Site Assets"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Update Site Assets" ON storage.objects;
CREATE POLICY "Auth Update Site Assets"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Delete Site Assets" ON storage.objects;
CREATE POLICY "Auth Delete Site Assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );
