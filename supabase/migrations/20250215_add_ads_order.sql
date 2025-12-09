/*
  # Adicionar Ordenação de Anúncios
  1. Alterações na Tabela
    - Adiciona coluna `display_order` (integer) na tabela `ads`.
  2. Funções Auxiliares
    - `increment_ad_orders`: Desloca a ordem dos banners existentes para abrir espaço para um novo.
*/

-- Adicionar coluna de ordem se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'display_order') THEN
        ALTER TABLE public.ads ADD COLUMN display_order INTEGER DEFAULT 1;
    END IF;
END $$;

-- Função para reordenar banners (empurrar para baixo)
CREATE OR REPLACE FUNCTION increment_ad_orders(p_position text, p_min_order int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ads
  SET display_order = display_order + 1
  WHERE position = p_position
  AND display_order >= p_min_order;
END;
$$;
