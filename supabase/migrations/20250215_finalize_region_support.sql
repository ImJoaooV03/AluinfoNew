/*
  # Finalizar Suporte Multi-Região
  1. Adicionar coluna 'region' em tabelas restantes:
     - categories
     - leads
     - media_kit_settings
     - hero_slides (garantir)
     - ads (garantir)
     - technical_materials (garantir)
     - ebooks (garantir)
     - events (garantir)
  2. Remover restrição de singleton (linha única) do media_kit_settings para permitir um por região.
*/

-- 1. Categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';

-- 2. Leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';

-- 3. Media Kit Settings
-- Primeiro, remover a restrição que forçava id=1
ALTER TABLE public.media_kit_settings DROP CONSTRAINT IF EXISTS single_row;

-- Adicionar coluna region
ALTER TABLE public.media_kit_settings 
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';

-- Adicionar restrição única para (region) para garantir apenas um kit por região
ALTER TABLE public.media_kit_settings 
ADD CONSTRAINT unique_media_kit_per_region UNIQUE (region);

-- 4. Garantir nas outras tabelas (caso o script anterior tenha falhado ou sido parcial)
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';
ALTER TABLE public.technical_materials ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'pt';

-- 5. Atualizar RLS Policies para incluir verificação de região (Opcional mas recomendado para segurança extra)
-- Por enquanto, o frontend fará a filtragem, mas é boa prática garantir que RLS permita acesso.
-- As policies existentes "Public read..." geralmente usam "USING (true)" ou status='published', 
-- o que já permite leitura. A filtragem será feita na query do Supabase client.
