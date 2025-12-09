-- Habilita a extensão pgcrypto para criptografia de senhas (necessário para criar usuários via SQL)
create extension if not exists "pgcrypto";

-- Cria a tabela de perfis públicos se não existir
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  role text default 'viewer', -- 'super_admin', 'editor', 'viewer'
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilita RLS (Row Level Security) na tabela profiles
alter table public.profiles enable row level security;

-- Remove políticas existentes para evitar conflitos ao rodar novamente
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- Cria políticas de segurança
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );
  
-- Política para admins (simplificada para este exemplo)
create policy "Admins can update any profile"
  on public.profiles for all
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin') );

-- Script para criar o Usuário Admin Automaticamente
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_email text := 'adm@aluinfo.com';
  user_password text := 'ADMin2025@#@!Aluinfo';
  encrypted_pw text;
BEGIN
  -- Verifica se o usuário já existe para não duplicar
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    -- Gera o hash da senha
    encrypted_pw := crypt(user_password, gen_salt('bf'));
    
    -- Insere o usuário na tabela de autenticação do Supabase (auth.users)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      encrypted_pw,
      now(), -- Confirma o email automaticamente
      null,
      null,
      '{"provider":"email","providers":["email"]}',
      '{"name":"Super Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Cria o perfil público associado em public.profiles
    INSERT INTO public.profiles (id, email, name, role, avatar_url)
    VALUES (
      new_user_id, 
      user_email, 
      'Super Admin', 
      'super_admin',
      'https://ui-avatars.com/api/?name=Super+Admin&background=F37021&color=fff'
    );
    
    RAISE NOTICE 'Usuário Admin criado com sucesso: %', user_email;
  ELSE
    RAISE NOTICE 'Usuário Admin já existe: %', user_email;
  END IF;
END $$;
