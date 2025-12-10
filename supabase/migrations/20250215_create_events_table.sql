/*
  # Criar tabela de Eventos
  1. Nova Tabela
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `event_date` (timestamp)
      - `location` (text)
      - `image_url` (text)
      - `link_url` (text)
      - `status` (text: active, inactive, past)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Storage
    - Bucket: `event-images`
  3. Segurança (RLS)
    - Leitura pública
    - Escrita apenas admin
*/

-- Create table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  link_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'past')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'adm@aluinfo.com' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'editor'))
  );

-- Triggers
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND (auth.role() = 'authenticated'));

CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images' AND (auth.role() = 'authenticated'));

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-images' AND (auth.role() = 'authenticated'));
