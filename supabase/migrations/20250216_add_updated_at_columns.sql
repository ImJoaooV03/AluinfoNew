/* 
  # Fix Schema: Add updated_at columns
  
  Adds 'updated_at' column to all content tables to fix PGRST204 errors.
  Also ensures moddatetime trigger is applied for automatic timestamp updates.
*/

-- Enable moddatetime extension if not already enabled
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 1. NEWS Table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.news;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 2. SUPPLIERS Table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.suppliers;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 3. FOUNDRIES Table
ALTER TABLE public.foundries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.foundries;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.foundries
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 4. ADS Table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.ads;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 5. TECHNICAL MATERIALS Table
ALTER TABLE public.technical_materials 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.technical_materials;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.technical_materials
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 6. EBOOKS Table
ALTER TABLE public.ebooks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.ebooks;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.ebooks
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 7. EVENTS Table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.events;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 8. HERO SLIDES Table
ALTER TABLE public.hero_slides 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.hero_slides;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 9. PROFILES Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 10. MEDIA KIT SETTINGS Table
ALTER TABLE public.media_kit_settings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP TRIGGER IF EXISTS handle_updated_at ON public.media_kit_settings;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.media_kit_settings
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
