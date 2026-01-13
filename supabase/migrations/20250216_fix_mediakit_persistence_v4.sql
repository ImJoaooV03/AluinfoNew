-- 1. Limpar duplicatas mantendo apenas o registro mais recente para cada região
DELETE FROM media_kit_settings
WHERE id NOT IN (
    SELECT DISTINCT ON (region) id
    FROM media_kit_settings
    ORDER BY region, updated_at DESC
);

-- 2. Garantir que a restrição de unicidade existe (para o UPSERT funcionar)
ALTER TABLE media_kit_settings DROP CONSTRAINT IF EXISTS media_kit_settings_region_key;
ALTER TABLE media_kit_settings ADD CONSTRAINT media_kit_settings_region_key UNIQUE (region);

-- 3. Resetar e corrigir permissões RLS (Segurança)
ALTER TABLE media_kit_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Read Access" ON media_kit_settings;
DROP POLICY IF EXISTS "Admin Full Access" ON media_kit_settings;
DROP POLICY IF EXISTS "media_kit_read_all" ON media_kit_settings;
DROP POLICY IF EXISTS "media_kit_write_auth" ON media_kit_settings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON media_kit_settings;

-- Política 1: Qualquer pessoa (público) pode LER (necessário para o download funcionar)
CREATE POLICY "media_kit_read_public" 
ON media_kit_settings FOR SELECT 
USING (true);

-- Política 2: Apenas Admins (autenticados) podem INSERIR, ATUALIZAR ou DELETAR
CREATE POLICY "media_kit_write_admin" 
ON media_kit_settings FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
