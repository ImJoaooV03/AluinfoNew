-- Create market_indicators table
CREATE TABLE IF NOT EXISTS market_indicators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  region text NOT NULL,
  aluminum_price text DEFAULT '$2868.00',
  aluminum_change text DEFAULT '+1.40%',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT market_indicators_region_key UNIQUE (region)
);

-- Enable RLS
ALTER TABLE market_indicators ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read access" ON market_indicators;
CREATE POLICY "Public read access" ON market_indicators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access" ON market_indicators;
CREATE POLICY "Admin full access" ON market_indicators FOR ALL USING (auth.role() = 'authenticated');

-- Insert default values for existing regions
INSERT INTO market_indicators (region, aluminum_price, aluminum_change) VALUES
('pt', '$2868.00', '+1.40%'),
('mx', '$2868.00', '+1.40%'),
('en', '$2868.00', '+1.40%')
ON CONFLICT (region) DO NOTHING;
