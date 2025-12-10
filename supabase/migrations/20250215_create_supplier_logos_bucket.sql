/*
  # Criar Bucket para Logotipos de Fornecedores
  1. Storage
    - Cria o bucket 'supplier-logos'
  2. Políticas de Segurança
    - Leitura pública (para exibir no site)
    - Upload/Update/Delete apenas para usuários autenticados (admins)
*/

-- Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-logos', 'supplier-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Leitura Pública
CREATE POLICY "Public can view supplier logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'supplier-logos');

-- Política de Inserção (Admins)
CREATE POLICY "Admins can upload supplier logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'supplier-logos' AND (auth.role() = 'authenticated'));

-- Política de Atualização (Admins)
CREATE POLICY "Admins can update supplier logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'supplier-logos' AND (auth.role() = 'authenticated'));

-- Política de Exclusão (Admins)
CREATE POLICY "Admins can delete supplier logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'supplier-logos' AND (auth.role() = 'authenticated'));
