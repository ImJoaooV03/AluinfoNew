/*
  # Fix Profiles Schema
  1. Add missing columns to profiles table:
     - full_name (text)
     - avatar_url (text)
     - updated_at (timestamptz)
*/

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Reload schema cache to ensure API is aware of new columns
NOTIFY pgrst, 'reload config';
