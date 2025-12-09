/*
  # CORREÇÃO DEFINITIVA DE RECURSÃO INFINITA (NUCLEAR OPTION)
  
  Este script:
  1. Remove TODAS as políticas existentes da tabela profiles para limpar conflitos.
  2. Recria a função de verificação de admin com SECURITY DEFINER (bypassa RLS).
  3. Cria novas políticas limpas e sem loops.
*/

-- 1. Remover TODAS as políticas existentes da tabela profiles de forma dinâmica
DO $$ 
DECLARE 
  r RECORD; 
BEGIN 
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP 
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles'; 
  END LOOP; 
END $$;

-- 2. Remover a função antiga para garantir que a nova versão seja usada
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. Criar a função segura que evita a recursão
-- SECURITY DEFINER é o segredo: ela roda com permissões de superusuário,
-- lendo a tabela sem disparar as políticas de segurança novamente.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'editor')
  );
END;
$$;

-- 4. Garantir que RLS está ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar Novas Políticas Limpas

-- Política A: Todo usuário pode ver seu próprio perfil
CREATE POLICY "Users can see own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Política B: Admins podem ver TODOS os perfis (usa a função segura)
CREATE POLICY "Admins can see all profiles"
ON public.profiles
FOR SELECT
USING (is_admin());

-- Política C: Admins podem editar perfis
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (is_admin());

-- Política D: Admins podem deletar perfis
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_admin());

-- Política E: Inserção (necessário para novos cadastros via trigger ou manual)
CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
