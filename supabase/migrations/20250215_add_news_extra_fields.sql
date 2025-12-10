/*
  # Adicionar campos extras para Notícias
  
  Adiciona colunas para suportar todos os detalhes da página de artigo:
  - author_role: Cargo do autor (ex: Editor Chefe)
  - read_time: Tempo de leitura estimado (ex: 5 min)
  - tags: Array de tags para SEO e relacionamentos
*/

ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS author_role text,
ADD COLUMN IF NOT EXISTS read_time text,
ADD COLUMN IF NOT EXISTS tags text[];
