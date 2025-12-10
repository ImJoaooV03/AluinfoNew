/*
  # Adicionar Avatar do Autor em Notícias
  Adiciona a coluna author_avatar na tabela news para exibir a foto do colunista/autor.
*/

ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS author_avatar text;

-- Atualizar cache do schema
NOTIFY pgrst, 'reload config';
