/*
  # Atualização do Schema de Fundições
  1. Novos Campos
    - `whatsapp` na tabela `foundries`
  2. Novas Tabelas
    - `foundry_capabilities`: Para listar serviços/capacidades (Título, Descrição)
    - `foundry_gallery`: Para armazenar imagens da galeria
  3. Storage
    - Buckets: `foundry-logos`, `foundry-gallery`
  4. Segurança
    - RLS e Políticas de Storage
*/

-- 1. Adicionar campo WhatsApp
ALTER TABLE public.foundries ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 2. Tabela de Capacidades
CREATE TABLE IF NOT EXISTS public.foundry_capabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  foundry_id UUID REFERENCES public.foundries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Galeria
CREATE TABLE IF NOT EXISTS public.foundry_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  foundry_id UUID REFERENCES public.foundries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.foundry_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundry_gallery ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso (Leitura Pública, Escrita Admin)
CREATE POLICY "Public read capabilities" ON public.foundry_capabilities FOR SELECT USING (true);
CREATE POLICY "Admin manage capabilities" ON public.foundry_capabilities FOR ALL USING (
  auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'editor'))
);

CREATE POLICY "Public read gallery" ON public.foundry_gallery FOR SELECT USING (true);
CREATE POLICY "Admin manage gallery" ON public.foundry_gallery FOR ALL USING (
  auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'editor'))
);

-- 6. Buckets de Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('foundry-logos', 'foundry-logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('foundry-gallery', 'foundry-gallery', true) ON CONFLICT (id) DO NOTHING;

-- 7. Políticas de Storage
CREATE POLICY "Public view foundry logos" ON storage.objects FOR SELECT USING (bucket_id = 'foundry-logos');
CREATE POLICY "Admin manage foundry logos" ON storage.objects FOR ALL USING (bucket_id = 'foundry-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Public view foundry gallery" ON storage.objects FOR SELECT USING (bucket_id = 'foundry-gallery');
CREATE POLICY "Admin manage foundry gallery" ON storage.objects FOR ALL USING (bucket_id = 'foundry-gallery' AND auth.role() = 'authenticated');
