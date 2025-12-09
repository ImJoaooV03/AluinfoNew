/*
  # Criar tabela de Publicidade (Ads) e Storage
  1. Nova Tabela `ads`
    - Gerenciamento de banners, links e posicionamento
    - Métricas simples (views, clicks)
  2. Storage
    - Bucket `ad-banners` para imagens publicitárias
  3. Segurança
    - RLS para proteção administrativa
*/

-- Create Ads Table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar', -- sidebar, home_top, home_middle, etc.
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled')),
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  client_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active ads"
  ON public.ads
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage ads"
  ON public.ads
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'adm@aluinfo.com'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Create Storage Bucket for Ads
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-banners', 'ad-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access Ads"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'ad-banners' );

CREATE POLICY "Admin Upload Ads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ad-banners' AND
    (auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')))
  );

CREATE POLICY "Admin Update Ads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ad-banners' AND
    (auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')))
  );

CREATE POLICY "Admin Delete Ads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ad-banners' AND
    (auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')))
  );
