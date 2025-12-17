-- Add payment machine fields to user_settings
ALTER TABLE user_settings
ADD COLUMN debit_fee_percent DECIMAL(5, 2) DEFAULT 1.99,
ADD COLUMN credit_fee_percent DECIMAL(5, 2) DEFAULT 3.99;

-- Add payment method fields to daily_records
ALTER TABLE daily_records
ADD COLUMN received_debit DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN received_credit DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN received_cash_pix DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing records to set default values
UPDATE daily_records 
SET received_cash_pix = received_outside_app 
WHERE received_cash_pix = 0;
