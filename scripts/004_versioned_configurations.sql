-- Create configuration versions table
CREATE TABLE IF NOT EXISTS config_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  
  -- Vehicle settings
  car_model VARCHAR(255) NOT NULL,
  gas_price DECIMAL(10, 2) NOT NULL,
  fuel_efficiency DECIMAL(10, 2) NOT NULL,
  maintenance_cost_per_km DECIMAL(10, 4) NOT NULL,
  
  -- App and service fees
  app_fee_per_ride DECIMAL(10, 2) NOT NULL,
  debit_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 1.99,
  credit_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 3.99,
  
  -- Monthly costs
  monthly_car_wash DECIMAL(10, 2) NOT NULL,
  avg_work_days_per_month INTEGER NOT NULL DEFAULT 26,
  
  -- Add IPVA and Insurance fields
  annual_ipva DECIMAL(10, 2) NOT NULL DEFAULT 0,
  annual_insurance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  work_days_per_year INTEGER NOT NULL DEFAULT 260,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, effective_date)
);

-- Migrate existing user_settings to config_versions
INSERT INTO config_versions (
  user_id, effective_date, car_model, gas_price, fuel_efficiency,
  maintenance_cost_per_km, app_fee_per_ride, debit_fee_percent,
  credit_fee_percent, monthly_car_wash, avg_work_days_per_month,
  annual_ipva, annual_insurance, work_days_per_year
)
SELECT 
  user_id,
  CURRENT_DATE as effective_date,
  car_model,
  gas_price,
  fuel_efficiency,
  maintenance_cost_per_km,
  app_fee_per_ride,
  COALESCE(debit_fee_percent, 1.99),
  COALESCE(credit_fee_percent, 3.99),
  monthly_car_wash,
  avg_work_days_per_month,
  0 as annual_ipva,
  0 as annual_insurance,
  260 as work_days_per_year
FROM user_settings
ON CONFLICT (user_id, effective_date) DO NOTHING;

-- Add config_version_id to daily_records to preserve historical configuration
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS config_version_id UUID REFERENCES config_versions(id);

-- Add calculated fields to daily_records (stored values, not recalculated)
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS fuel_cost DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS maintenance_cost DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS app_fees DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS car_wash_cost DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS debit_fee DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS credit_fee DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS daily_ipva_cost DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS daily_insurance_cost DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS total_operational_costs DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS operational_profit DECIMAL(10, 2);
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS net_profit DECIMAL(10, 2);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_config_versions_user_date ON config_versions(user_id, effective_date DESC);

-- Enable RLS
ALTER TABLE config_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own config versions"
  ON config_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config versions"
  ON config_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config versions"
  ON config_versions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config versions"
  ON config_versions FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to get active config for a date
CREATE OR REPLACE FUNCTION get_active_config_for_date(p_user_id UUID, p_date DATE)
RETURNS UUID AS $$
DECLARE
  config_id UUID;
BEGIN
  SELECT id INTO config_id
  FROM config_versions
  WHERE user_id = p_user_id 
    AND effective_date <= p_date
  ORDER BY effective_date DESC
  LIMIT 1;
  
  RETURN config_id;
END;
$$ LANGUAGE plpgsql;
