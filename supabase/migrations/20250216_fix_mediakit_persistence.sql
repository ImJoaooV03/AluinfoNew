-- Garante que as permissões de leitura e escrita estejam corretas para o Mídia Kit
-- Isso resolve o problema do arquivo "sumir" após recarregar a página

-- 1. Habilitar RLS (segurança) na tabela
ALTER TABLE media_kit_settings ENABLE ROW LEVEL SECURITY;

-- 2. Política de LEITURA (SELECT): Permitir que TODOS vejam (Público e Admins)
-- Isso é crucial para que o fetch na página de Admin e o download na página pública funcionem
DROP POLICY IF EXISTS "Public Read Media Kit" ON media_kit_settings;
CREATE POLICY "Public Read Media Kit"
ON media_kit_settings FOR SELECT
USING (true);

-- 3. Política de ESCRITA (ALL): Permitir que apenas ADMINS insiram/atualizem/deletem
DROP POLICY IF EXISTS "Admin Full Access Media Kit" ON media_kit_settings;
CREATE POLICY "Admin Full Access Media Kit"
ON media_kit_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Garantir permissões no Storage (Bucket) também
-- Permitir leitura pública dos arquivos
DROP POLICY IF EXISTS "Public Access Media Kits Bucket" ON storage.objects;
CREATE POLICY "Public Access Media Kits Bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media-kits' );

-- Permitir upload/delete para admins
DROP POLICY IF EXISTS "Auth Upload Media Kits Bucket" ON storage.objects;
CREATE POLICY "Auth Upload Media Kits Bucket"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Update Media Kits Bucket" ON storage.objects;
CREATE POLICY "Auth Update Media Kits Bucket"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );
