/*
  # Criar Tabela de Materiais Técnicos e Storage
  
  1. Nova Tabela: `technical_materials`
     - id, title, description, category, file_url, cover_url
     - downloads (contador)
     - status (published/draft)
  
  2. Storage Buckets:
     - `materials-files`: Para PDFs, DOCs
     - `materials-covers`: Para imagens de capa
  
  3. Políticas de Segurança (RLS)
*/

-- Criar a tabela
CREATE TABLE IF NOT EXISTS public.technical_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Rico texto opcional
  category TEXT DEFAULT 'Manual',
  file_url TEXT, -- Link do PDF
  cover_url TEXT, -- Link da Imagem
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.technical_materials ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Public can view published materials"
  ON public.technical_materials FOR SELECT
  USING (status = 'published' OR (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin', 'editor')
    )
  ));

CREATE POLICY "Admins can manage materials"
  ON public.technical_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.technical_materials
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Criar Buckets de Storage (se não existirem)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials-files', 'materials-files', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('materials-covers', 'materials-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (Arquivos)
CREATE POLICY "Public Access Files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'materials-files' );

CREATE POLICY "Admin Upload Files"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'materials-files' AND (auth.role() = 'authenticated') );

CREATE POLICY "Admin Update Files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'materials-files' AND (auth.role() = 'authenticated') );

CREATE POLICY "Admin Delete Files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'materials-files' AND (auth.role() = 'authenticated') );

-- Políticas de Storage (Capas)
CREATE POLICY "Public Access Covers"
ON storage.objects FOR SELECT
USING ( bucket_id = 'materials-covers' );

CREATE POLICY "Admin Upload Covers"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'materials-covers' AND (auth.role() = 'authenticated') );

CREATE POLICY "Admin Update Covers"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'materials-covers' AND (auth.role() = 'authenticated') );

CREATE POLICY "Admin Delete Covers"
ON storage.objects FOR DELETE
USING ( bucket_id = 'materials-covers' AND (auth.role() = 'authenticated') );
