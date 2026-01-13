-- RECRIAÇÃO COMPLETA DA TABELA MEDIA_KIT_SETTINGS
-- Objetivo: Eliminar erros de RLS (permissão) e duplicidade (constraint) definitivamente.

-- 1. Remover tabela antiga (se existir) para limpar estado
DROP TABLE IF EXISTS public.media_kit_settings;

-- 2. Criar nova tabela com estrutura limpa
CREATE TABLE public.media_kit_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT media_kit_region_unique UNIQUE (region) -- Garante apenas 1 kit por região
);

-- 3. Habilitar Segurança (RLS)
ALTER TABLE public.media_kit_settings ENABLE ROW LEVEL SECURITY;

-- 4. Política: QUALQUER UM pode ler (Necessário para o botão de download público funcionar)
CREATE POLICY "Public Read Access"
ON public.media_kit_settings FOR SELECT
USING (true);

-- 5. Política: APENAS USUÁRIOS LOGADOS podem inserir/atualizar/deletar
CREATE POLICY "Authenticated Full Access"
ON public.media_kit_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 6. Garantir permissões básicas
GRANT ALL ON public.media_kit_settings TO authenticated;
GRANT SELECT ON public.media_kit_settings TO anon;
GRANT ALL ON public.media_kit_settings TO service_role;

-- Comentário de Migração
COMMENT ON TABLE public.media_kit_settings IS 'Tabela recriada para corrigir persistência do Mídia Kit por região';
