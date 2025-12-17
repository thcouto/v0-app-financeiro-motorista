-- Add app paid amount field (calculated or manual)
ALTER TABLE daily_records
ADD COLUMN app_paid_amount DECIMAL(10, 2);

-- Add day classification field
ALTER TABLE daily_records
ADD COLUMN day_classification VARCHAR(20) CHECK (day_classification IN ('Bom', 'Médio', 'Ruim'));

-- Add classification explanation field
ALTER TABLE daily_records
ADD COLUMN classification_explanation TEXT;

-- Note: Other requested fields like "custo total", "lucro líquido operacional", 
-- "lucro real" are calculated fields based on settings, so they will be computed 
-- in the application layer rather than stored in the database.
