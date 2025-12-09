-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    category TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC(2, 1) DEFAULT 0.0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow read access to everyone (public catalog)
CREATE POLICY "Allow public read access" ON public.suppliers
    FOR SELECT USING (true);

-- Allow write access only to admins
CREATE POLICY "Allow admin insert" ON public.suppliers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'editor')
        )
    );

CREATE POLICY "Allow admin update" ON public.suppliers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'editor')
        )
    );

CREATE POLICY "Allow admin delete" ON public.suppliers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
