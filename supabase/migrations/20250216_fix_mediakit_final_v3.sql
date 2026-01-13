-- Resetar RLS para garantir acesso total aos admins e leitura pública
ALTER TABLE media_kit_settings DISABLE ROW LEVEL SECURITY;

-- Garantir que a constraint de unicidade existe (necessário para evitar duplicatas)
ALTER TABLE media_kit_settings DROP CONSTRAINT IF EXISTS media_kit_settings_region_key;
ALTER TABLE media_kit_settings ADD CONSTRAINT media_kit_settings_region_key UNIQUE (region);

-- Reabilitar RLS
ALTER TABLE media_kit_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Read" ON media_kit_settings;
DROP POLICY IF EXISTS "Admin All" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON media_kit_settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON media_kit_settings;
DROP POLICY IF EXISTS "Allow all for admin" ON media_kit_settings;

-- Criar políticas simplificadas e permissivas
-- 1. Qualquer um pode ler (para o download funcionar no site)
CREATE POLICY "Public Read Access" 
ON media_kit_settings FOR SELECT 
USING (true);

-- 2. Usuários logados (admins) podem fazer tudo (Insert, Update, Delete)
CREATE POLICY "Admin Full Access" 
ON media_kit_settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
