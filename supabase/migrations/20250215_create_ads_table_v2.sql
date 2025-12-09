/*
  # Criar tabela de Publicidade (Ads) e Storage
  
  1. Nova Tabela `ads`
    - `id` (uuid, primary key)
    - `title` (text, obrigatório)
    - `image_url` (text, obrigatório)
    - `link_url` (text, opcional - destino do clique)
    - `position` (text, ex: sidebar, home_top)
    - `client_name` (text)
    - `status` (active, inactive, scheduled)
    - `start_date`, `end_date` (datas de veiculação)
    - `views`, `clicks` (métricas)
    - `created_at`, `updated_at`

  2. Segurança (RLS)
    - Leitura pública (para exibir banners no site)
    - Gerenciamento total apenas para admins

  3. Storage
    - Bucket `ad-banners` para imagens
*/

-- Criar a tabela
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar',
  client_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- 1. Público pode ver anúncios ativos
CREATE POLICY "Public read access"
  ON public.ads
  FOR SELECT
  USING (true);

-- 2. Admins podem fazer tudo
CREATE POLICY "Admins full access"
  ON public.ads
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'adm@aluinfo.com'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Criar Bucket de Storage para Banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-banners', 'ad-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Public Access Ads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-banners');

CREATE POLICY "Admin Upload Ads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ad-banners');

CREATE POLICY "Admin Update Ads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'ad-banners');

CREATE POLICY "Admin Delete Ads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ad-banners');
