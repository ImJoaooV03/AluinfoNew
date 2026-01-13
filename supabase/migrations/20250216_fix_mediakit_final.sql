-- CORREÇÃO DEFINITIVA PARA MEDIA KIT E INDICADORES
-- 1. Garantir unicidade na coluna 'region' para evitar duplicatas
DO $$
BEGIN
    -- Se a constraint ainda não existir, vamos criá-la
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'media_kit_settings_region_key'
    ) THEN
        -- Primeiro, removemos duplicatas se existirem (mantendo a mais recente)
        DELETE FROM public.media_kit_settings a USING public.media_kit_settings b
        WHERE a.id &lt; b.id AND a.region = b.region;
        
        -- Adiciona a constraint UNIQUE na região
        ALTER TABLE public.media_kit_settings ADD CONSTRAINT media_kit_settings_region_key UNIQUE (region);
    END IF;
END $$;

-- 2. Refazer Políticas de Segurança (RLS) para garantir acesso total ao Admin
ALTER TABLE public.media_kit_settings ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Allow public read access" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Allow admin all" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Media Kit Public Read" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Media Kit Admin All" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.media_kit_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.media_kit_settings;

-- Política 1: Público pode ler (Download)
CREATE POLICY "Media Kit Public Read"
ON public.media_kit_settings FOR SELECT
USING (true);

-- Política 2: Admin pode fazer TUDO (Select, Insert, Update, Delete)
CREATE POLICY "Media Kit Admin All"
ON public.media_kit_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Aplicar o mesmo para a tabela de Indicadores (Market Indicators)
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Indicators Public Read" ON public.market_indicators;
DROP POLICY IF EXISTS "Indicators Admin All" ON public.market_indicators;

CREATE POLICY "Indicators Public Read"
ON public.market_indicators FOR SELECT
USING (true);

CREATE POLICY "Indicators Admin All"
ON public.market_indicators FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
