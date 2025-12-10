/*
  # Adicionar configuração de botões para Fornecedores e Produtos
  1. Alterações em Tabela
    - `suppliers`: Adiciona coluna `whatsapp` para o botão "Enviar Mensagem"
    - `supplier_products`: Adiciona coluna `link_url` para o botão "Ver Detalhes"
*/

DO $$
BEGIN
    -- Adicionar whatsapp na tabela suppliers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'whatsapp') THEN
        ALTER TABLE public.suppliers ADD COLUMN whatsapp TEXT;
    END IF;

    -- Adicionar link_url na tabela supplier_products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_products' AND column_name = 'link_url') THEN
        ALTER TABLE public.supplier_products ADD COLUMN link_url TEXT;
    END IF;
END $$;
