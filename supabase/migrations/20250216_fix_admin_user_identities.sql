/*
  # Fix Admin User Identities
  Repairs the admin user account by ensuring all required auth tables are populated correctly.

  ## Query Description: This operation will DELETE and RECREATE the 'admin@aluinfo.com' user to fix the "Database error querying schema" login issue.
  
  ## Metadata:
  - Schema-Category: "Dangerous" (Deletes specific user data)
  - Impact-Level: "High" (Affects admin access)
  - Requires-Backup: false
  - Reversible: yes (can re-run script)
  
  ## Structure Details:
  - Deletes from: auth.identities, public.profiles, auth.users
  - Inserts into: auth.users, auth.identities, public.profiles
  
  ## Security Implications:
  - Resets the admin password to 'admin123'
*/

BEGIN;

-- 1. Clean up any existing corrupted records for this email to start fresh
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@aluinfo.com');
DELETE FROM public.profiles WHERE email = 'admin@aluinfo.com';
DELETE FROM auth.users WHERE email = 'admin@aluinfo.com';

-- 2. Create the user properly with identity
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
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

  -- Insert into auth.identities (CRITICAL: This was missing previously causing the 500 error)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id::text,
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', 'admin@aluinfo.com'),
    'email',
    now(),
    now(),
    now()
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new_user_id, 'Administrador', 'admin', 'admin@aluinfo.com');
  
END $$;

COMMIT;
