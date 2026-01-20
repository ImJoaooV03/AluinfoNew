-- Enable pgcrypto for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert default admin user if not exists
-- User: admin@aluinfo.com
-- Pass: admin123
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@aluinfo.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      role,
      aud,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@aluinfo.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrador"}',
      now(),
      now(),
      '',
      ''
    );

    -- Create profile for the new user in public schema
    INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
    VALUES (new_user_id, 'admin@aluinfo.com', 'admin', 'Administrador', now(), now())
    ON CONFLICT (id) DO NOTHING;
    
  END IF;
END $$;
