-- Adiciona a coluna parent_id para criar a hierarquia
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Cria um índice para melhorar a performance de buscas hierárquicas
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Comentário para documentação
COMMENT ON COLUMN categories.parent_id IS 'ID da categoria pai. Se NULL, é uma categoria principal.';
