/*
  # Adicionar Suporte Multi-Tenant (Regiões)
  
  Adiciona a coluna 'region' a todas as tabelas principais para isolamento de dados.
  Valores permitidos: 'pt' (Brasil), 'mx' (México), 'en' (Global/USA).
  Default: 'pt' (Para manter compatibilidade com dados existentes).
*/

-- Função auxiliar para adicionar coluna se não existir
CREATE OR REPLACE FUNCTION add_region_column(tbl text) RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS region text DEFAULT ''pt''', tbl);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_region ON %I(region)', tbl, tbl);
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas as tabelas de conteúdo
SELECT add_region_column('news');
SELECT add_region_column('suppliers');
SELECT add_region_column('foundries');
SELECT add_region_column('events');
SELECT add_region_column('ebooks');
SELECT add_region_column('technical_materials');
SELECT add_region_column('ads');
SELECT add_region_column('hero_slides');
SELECT add_region_column('categories');
SELECT add_region_column('leads');

-- Atualizar RLS Policies (Exemplo para News - Repetir lógica para outros se necessário rigidez extrema)
-- Na prática, o frontend filtrará, mas RLS pode reforçar se o usuário tiver claim de região.
-- Por enquanto, mantemos a leitura pública filtrada pelo front, e escrita baseada em admin.

-- Limpar função auxiliar
DROP FUNCTION add_region_column;
