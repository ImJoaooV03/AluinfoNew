/*
  # Adicionar campos extras na tabela de Eventos
  - category: Para classificar (Feira, Congresso, Workshop)
  - organizer: Quem está organizando o evento
*/

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS organizer text;
