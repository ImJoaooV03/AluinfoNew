-- 1. Garantir que o bucket 'media-kits' exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-kits', 'media-kits', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar Políticas de Segurança (RLS) para o Storage
-- Permitir leitura pública (para download no site)
DROP POLICY IF EXISTS "Public Access Media Kits" ON storage.objects;
CREATE POLICY "Public Access Media Kits"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media-kits' );

-- Permitir upload para usuários autenticados (admins)
DROP POLICY IF EXISTS "Auth Upload Media Kits" ON storage.objects;
CREATE POLICY "Auth Upload Media Kits"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

-- Permitir atualização para usuários autenticados
DROP POLICY IF EXISTS "Auth Update Media Kits" ON storage.objects;
CREATE POLICY "Auth Update Media Kits"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

-- Permitir deleção para usuários autenticados
DROP POLICY IF EXISTS "Auth Delete Media Kits" ON storage.objects;
CREATE POLICY "Auth Delete Media Kits"
ON storage.objects FOR DELETE
USING ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

-- 3. Reforçar permissões na tabela de configurações (caso ainda não estejam corretas)
ALTER TABLE public.media_kit_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.media_kit_settings;
CREATE POLICY "Enable read access for all users" ON public.media_kit_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.media_kit_settings;
CREATE POLICY "Enable insert for authenticated users only" ON public.media_kit_settings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.media_kit_settings;
CREATE POLICY "Enable update for authenticated users only" ON public.media_kit_settings
FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.media_kit_settings;
CREATE POLICY "Enable delete for authenticated users only" ON public.media_kit_settings
FOR DELETE USING (auth.role() = 'authenticated');
