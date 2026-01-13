-- 1. Remover duplicatas mantendo apenas o registro mais recente para cada região
-- Usamos uma subquery com ROW_NUMBER para identificar duplicatas de forma segura no Postgres
DELETE FROM media_kit_settings
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (PARTITION BY region ORDER BY updated_at DESC) as row_num
        FROM media_kit_settings
    ) t
    WHERE t.row_num > 1
);

-- 2. Garantir que a restrição de unicidade existe
-- Primeiro removemos se existir (para evitar erros) e depois criamos
ALTER TABLE media_kit_settings DROP CONSTRAINT IF EXISTS media_kit_settings_region_key;
ALTER TABLE media_kit_settings ADD CONSTRAINT media_kit_settings_region_key UNIQUE (region);

-- 3. Recriar Políticas de Segurança (RLS) para garantir acesso total aos admins
ALTER TABLE media_kit_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Read Media Kit" ON media_kit_settings;
DROP POLICY IF EXISTS "Admin Manage Media Kit" ON media_kit_settings;
DROP POLICY IF EXISTS "Admin Insert Media Kit" ON media_kit_settings;
DROP POLICY IF EXISTS "Admin Update Media Kit" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON media_kit_settings;

-- Política de Leitura Pública (Qualquer um pode baixar)
CREATE POLICY "Public Read Media Kit" 
ON media_kit_settings FOR SELECT 
USING (true);

-- Política de Gerenciamento Total para Admins (Authenticated)
-- Permite INSERT, UPDATE, DELETE para usuários logados
CREATE POLICY "Admin Manage Media Kit" 
ON media_kit_settings FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Garantir permissões no Bucket de Storage (caso ainda não tenha)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-kits', 'media-kits', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Media Kit Public Read" ON storage.objects;
CREATE POLICY "Media Kit Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media-kits' );

DROP POLICY IF EXISTS "Media Kit Admin Upload" ON storage.objects;
CREATE POLICY "Media Kit Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Media Kit Admin Update" ON storage.objects;
CREATE POLICY "Media Kit Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media-kits' AND auth.role() = 'authenticated' );
