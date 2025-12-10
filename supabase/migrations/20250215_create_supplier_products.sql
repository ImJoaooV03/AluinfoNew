/*
  # Criar tabela de Produtos do Fornecedor
  1. Nova Tabela
    - `supplier_products`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, fk para suppliers)
      - `name` (text)
      - `category` (text)
      - `price` (text)
      - `description` (text)
      - `image_url` (text)
      - `type` (text: 'product' ou 'service')
      - `created_at` (timestamp)
  2. Segurança (RLS)
    - Leitura pública
    - Escrita apenas admin
*/

CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  price TEXT,
  description TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view supplier products"
  ON public.supplier_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage supplier products"
  ON public.supplier_products FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'editor'))
  );

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.supplier_products
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Storage bucket for product images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'authenticated'));

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND (auth.role() = 'authenticated'));

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND (auth.role() = 'authenticated'));
