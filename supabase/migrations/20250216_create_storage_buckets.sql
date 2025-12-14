/*
  # Create Missing Storage Buckets

  ## Query Description:
  Creates all necessary storage buckets for the application features (Technical Materials, E-books, Events, Foundries, Ads, Media Kit).
  Sets up RLS policies for public read access and authenticated upload/delete access.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Inserts into storage.buckets for multiple features
  - Creates RLS policies on storage.objects for each bucket
*/

-- Function to create bucket and policies if not exists
DO $$
DECLARE
  b_name text;
BEGIN
  -- List of all buckets required by the application
  FOREACH b_name IN ARRAY ARRAY[
    'technical-materials', -- For PDF/DOC files
    'technical-covers',    -- For cover images of technical materials
    'ebooks-files',        -- For E-book PDFs
    'ebooks-covers',       -- For E-book cover images
    'event-images',        -- For Event banners
    'foundry-logos',       -- For Foundry logos
    'foundry-gallery',     -- For Foundry gallery images
    'ad-banners',          -- For Advertising banners
    'media-kits'           -- For Media Kit PDF
  ]
  LOOP
    -- 1. Create Bucket (Public)
    INSERT INTO storage.buckets (id, name, public)
    VALUES (b_name, b_name, true)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create Policies (using dynamic SQL to handle varying names safely)
    
    -- Policy: Public Select (Download/View)
    BEGIN
      EXECUTE format('CREATE POLICY "Public Access %s" ON storage.objects FOR SELECT USING ( bucket_id = %L )', b_name, b_name);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Policy: Auth Insert (Upload)
    BEGIN
      EXECUTE format('CREATE POLICY "Auth Upload %s" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = %L AND auth.role() = ''authenticated'' )', b_name, b_name);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Policy: Auth Update (Update)
    BEGIN
      EXECUTE format('CREATE POLICY "Auth Update %s" ON storage.objects FOR UPDATE USING ( bucket_id = %L AND auth.role() = ''authenticated'' )', b_name, b_name);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Policy: Auth Delete (Remove)
    BEGIN
      EXECUTE format('CREATE POLICY "Auth Delete %s" ON storage.objects FOR DELETE USING ( bucket_id = %L AND auth.role() = ''authenticated'' )', b_name, b_name);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    
  END LOOP;
END $$;
