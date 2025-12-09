/*
  # Configuração de Storage para Imagens de Notícias
  
  1. Criação do Bucket 'news-images'
  2. Políticas de Segurança (RLS) para o Storage
*/

-- Criar o bucket se não existir (nota: buckets geralmente são criados via API/Dashboard, 
-- mas inserimos na tabela storage.buckets para garantir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualquer pessoa pode ver as imagens (Público)
CREATE POLICY "Imagens de notícias são públicas"
ON storage.objects FOR SELECT
USING ( bucket_id = 'news-images' );

-- Política: Apenas usuários autenticados (Admins) podem fazer upload
CREATE POLICY "Admins podem fazer upload de imagens"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);

-- Política: Apenas usuários autenticados podem atualizar/deletar
CREATE POLICY "Admins podem atualizar imagens"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Admins podem deletar imagens"
ON storage.objects FOR DELETE
USING ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );
