-- CORREÇÃO DE RECURSÃO INFINITA (RLS FIX)
-- Este script substitui as políticas de segurança da tabela 'profiles' para evitar loops.

-- 1. Remover TODAS as políticas existentes na tabela profiles para começar limpo
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;

-- 2. Criar uma função segura para verificar se é admin
-- SECURITY DEFINER: Esta função roda com privilégios de sistema, ignorando o RLS para evitar o loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar as políticas usando a função segura

-- Leitura: Usuário vê o próprio perfil OU Admin vê todos
CREATE POLICY "Users can see own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

CREATE POLICY "Admins can see all profiles"
ON public.profiles FOR SELECT
USING ( is_admin() );

-- Escrita: Apenas Admins podem inserir, atualizar ou deletar (exceto o próprio usuário editar dados básicos se desejado)
CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK ( is_admin() );

CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING ( is_admin() );

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING ( is_admin() );

-- Garantir que RLS está ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
