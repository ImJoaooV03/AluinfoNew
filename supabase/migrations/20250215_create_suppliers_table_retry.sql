/*
  # Create Suppliers Table
  
  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `category` (text, required)
      - `description` (text)
      - `phone` (text)
      - `email` (text)
      - `location` (text)
      - `website` (text)
      - `logo_url` (text)
      - `status` (text: active/inactive)
      - `is_verified` (boolean)
      - `rating` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `suppliers` table
    - Add policies for public read access
    - Add policies for admin write/update/delete access
*/

-- Create suppliers table
create table if not exists public.suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  description text,
  phone text,
  email text,
  location text,
  website text,
  logo_url text,
  status text default 'active' check (status in ('active', 'inactive')),
  is_verified boolean default false,
  rating numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.suppliers enable row level security;

-- Policies

-- Public Read Access
create policy "Public suppliers are viewable by everyone"
  on public.suppliers for select
  using (true);

-- Admin Insert Access
create policy "Admins can insert suppliers"
  on public.suppliers for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin', 'editor')
    )
  );

-- Admin Update Access
create policy "Admins can update suppliers"
  on public.suppliers for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin', 'editor')
    )
  );

-- Admin Delete Access
create policy "Admins can delete suppliers"
  on public.suppliers for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
    )
  );

-- Trigger for updated_at (Requires moddatetime extension enabled)
create trigger handle_updated_at before update on public.suppliers
  for each row execute procedure moddatetime (updated_at);
