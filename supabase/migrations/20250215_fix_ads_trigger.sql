/*
  # Correção da Tabela de Anúncios e Trigger
  1. Garante que a tabela `ads` exista.
  2. Remove o trigger `handle_updated_at` se ele já existir para evitar o erro 42710.
  3. Recria o trigger corretamente.
  4. Atualiza as políticas de segurança (RLS) e o Storage.
*/

-- 1. Criar tabela se não existir (Idempotente)
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT 'sidebar',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garantir RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 3. Limpar políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;

-- 4. Recriar Políticas
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
      AND profiles.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- 5. CORREÇÃO DO ERRO: Remover trigger antes de criar
DROP TRIGGER IF EXISTS handle_updated_at ON public.ads;

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- 6. Configuração do Storage (Bucket de Banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-banners', 'ad-banners', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Políticas de Storage (Limpar e Recriar)
DROP POLICY IF EXISTS "Public Access Ads" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Ads" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Ads" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Ads" ON storage.objects;

CREATE POLICY "Public Access Ads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ad-banners' );

CREATE POLICY "Admin Upload Ads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-banners' AND
  (auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')))
);

CREATE POLICY "Admin Update Ads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ad-banners' AND
  (auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')))
);

CREATE POLICY "Admin Delete Ads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-banners' AND
  (auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')))
);

-- Confirmação
SELECT 'Tabela ads e triggers corrigidos com sucesso' as status;
