/*
  # Adicionar Coluna de Preferências
  1. Adiciona coluna 'preferences' (JSONB) na tabela 'profiles'.
  2. Define um valor padrão robusto para evitar nulos.
*/

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "notifications": {
    "email_news": true, 
    "email_security": true, 
    "push_comments": false, 
    "push_orders": true
  },
  "system": {
    "theme": "light", 
    "language": "pt"
  }
}'::jsonb;

-- Atualiza linhas existentes que possam estar nulas
UPDATE public.profiles 
SET preferences = '{
  "notifications": {
    "email_news": true, 
    "email_security": true, 
    "push_comments": false, 
    "push_orders": true
  },
  "system": {
    "theme": "light", 
    "language": "pt"
  }
}'::jsonb
WHERE preferences IS NULL;
