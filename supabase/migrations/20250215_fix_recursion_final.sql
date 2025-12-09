-- ==============================================================================
-- CORREÇÃO DE RECURSÃO INFINITA (RLS)
-- ==============================================================================

-- 1. Criar uma função segura para verificar o cargo do usuário
-- Esta função usa SECURITY DEFINER para rodar com permissões elevadas
-- e não disparar as políticas RLS novamente (quebrando o loop).
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER -- Importante: Roda com permissões do criador da função
SET search_path = public -- Segurança: Garante que usa o schema public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Limpar TODAS as políticas antigas da tabela profiles para evitar conflitos
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- 3. Garantir que RLS está ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar Novas Políticas (Sem Recursão)

-- POLÍTICA A: Usuários comuns podem ver APENAS seu próprio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- POLÍTICA B: Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- POLÍTICA C: Admins podem ver e editar TUDO
-- Aqui usamos a função segura get_user_role() em vez de consultar a tabela diretamente
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
  public.get_user_role() IN ('admin', 'super_admin')
);

-- 5. Garantir que o usuário ADMIN existe e tem permissão
-- Atualiza o usuário adm@aluinfo.com para super_admin caso ele já exista
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'adm@aluinfo.com';
