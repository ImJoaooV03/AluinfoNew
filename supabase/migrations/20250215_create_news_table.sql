/*
  # Create News Table
  Creates the table for storing news articles and sets up RLS policies.

  ## Structure
  - Table: news
  - Columns: id, title, summary, content, category, author, image_url, status, views, etc.

  ## Security
  - Public: Can view only 'published' news.
  - Admins/Editors: Can view, create, update, and delete all news.
*/

create table if not exists public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  summary text,
  content text,
  category text not null,
  author text,
  author_role text,
  author_avatar text,
  image_url text,
  is_highlight boolean default false,
  publish_date date default current_date,
  status text default 'published', -- 'published', 'draft', 'scheduled'
  views integer default 0,
  type text default 'news', -- 'news', 'technical', 'ebook', 'event'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.news enable row level security;

-- Policy: Public can read published news
create policy "Public can view published news"
  on public.news for select
  using (status = 'published');

-- Policy: Admins and Editors can do everything
create policy "Admins and Editors can manage news"
  on public.news for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin', 'editor')
    )
  );
