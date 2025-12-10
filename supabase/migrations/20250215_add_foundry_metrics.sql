/*
  # Adicionar Métricas de Fundição
  Adiciona colunas para armazenar os KPIs exibidos no perfil da fundição:
  - certification (ex: ISO 9001)
  - years_experience (ex: 25+)
  - monthly_capacity (ex: 500t)
  - market_reach (ex: 100% Nacional)
*/

ALTER TABLE public.foundries
ADD COLUMN IF NOT EXISTS certification text,
ADD COLUMN IF NOT EXISTS years_experience text,
ADD COLUMN IF NOT EXISTS monthly_capacity text,
ADD COLUMN IF NOT EXISTS market_reach text;
