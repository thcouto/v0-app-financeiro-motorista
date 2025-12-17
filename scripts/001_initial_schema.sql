-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User settings table (setup inicial)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_model VARCHAR(255) NOT NULL DEFAULT 'Chevrolet Onix 2020 1.0 Turbo',
  gas_price DECIMAL(10, 2) NOT NULL DEFAULT 6.04,
  fuel_efficiency DECIMAL(10, 2) NOT NULL DEFAULT 11.5,
  maintenance_cost_per_km DECIMAL(10, 4) NOT NULL DEFAULT 0.20,
  app_fee_per_ride DECIMAL(10, 2) NOT NULL DEFAULT 1.50,
  monthly_car_wash DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
  avg_work_days_per_month INTEGER NOT NULL DEFAULT 26,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Daily records table (registros diários)
CREATE TABLE daily_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  gross_revenue DECIMAL(10, 2) NOT NULL,
  km_driven DECIMAL(10, 2) NOT NULL,
  total_rides INTEGER NOT NULL,
  hours_online DECIMAL(5, 2),
  hours_working DECIMAL(5, 2),
  received_in_app DECIMAL(10, 2),
  received_outside_app DECIMAL(10, 2),
  personal_expenses DECIMAL(10, 2) DEFAULT 0.00,
  personal_expenses_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, record_date)
);

-- Indexes for better performance
CREATE INDEX idx_daily_records_user_date ON daily_records(user_id, record_date DESC);
CREATE INDEX idx_user_settings_user ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_records
CREATE POLICY "Users can view their own records"
  ON daily_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
  ON daily_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON daily_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON daily_records FOR DELETE
  USING (auth.uid() = user_id);
