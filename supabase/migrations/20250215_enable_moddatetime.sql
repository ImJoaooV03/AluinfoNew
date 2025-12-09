/*
  # Ativar Extensão moddatetime
  
  Este script ativa a extensão necessária para atualizar automaticamente
  o campo 'updated_at' nas tabelas.
*/

-- Habilita a extensão moddatetime no esquema 'extensions'
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;
