/*
  # Enable Products for Foundries
  
  1. Changes to `supplier_products` table:
     - Add `foundry_id` column (FK to foundries)
     - Make `supplier_id` nullable (so a product can belong to EITHER a supplier OR a foundry)
     - This effectively turns the table into a generic `company_products` table without renaming it to avoid breaking changes.
*/

-- Add foundry_id column
ALTER TABLE supplier_products 
ADD COLUMN IF NOT EXISTS foundry_id UUID REFERENCES foundries(id) ON DELETE CASCADE;

-- Make supplier_id nullable
ALTER TABLE supplier_products 
ALTER COLUMN supplier_id DROP NOT NULL;

-- Add constraint to ensure at least one parent is set (Optional but recommended for data integrity)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_owner_check') THEN
--         ALTER TABLE supplier_products
--         ADD CONSTRAINT product_owner_check CHECK (
--             (supplier_id IS NOT NULL AND foundry_id IS NULL) OR 
--             (supplier_id IS NULL AND foundry_id IS NOT NULL)
--         );
--     END IF;
-- END $$;
