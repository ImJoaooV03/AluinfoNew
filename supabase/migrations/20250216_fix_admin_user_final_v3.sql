-- File: supabase/migrations/20250216_fix_admin_user_final_v3.sql
-- Description: Fixes admin user creation by including required provider_id column in auth.identities

BEGIN;

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- 1. Clean up any existing corrupted records for this email to start fresh
  DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@aluinfo.com');
  DELETE FROM public.profiles WHERE email = 'admin@aluinfo.com';
  DELETE FROM auth.users WHERE email = 'admin@aluinfo.com';

  -- 2. Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@aluinfo.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 3. Insert into auth.identities (FIXED: Included provider_id)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id, -- Required column
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id, -- id (UUID)
    new_user_id, -- user_id (UUID)
    new_user_id::text, -- provider_id (text) - using user_id as provider_id for email provider
    jsonb_build_object('sub', new_user_id, 'email', 'admin@aluinfo.com'),
    'email',
    now(),
    now(),
    now()
  );

  -- 4. Insert into public.profiles
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new_user_id, 'Administrador', 'admin', 'admin@aluinfo.com');
  
END $$;

COMMIT;
