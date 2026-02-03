-- Investment Module Migration for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'other', -- 'stock', 'mutual_fund', 'crypto', 'bond', 'property', 'gold', 'deposit', 'other'
  ticker VARCHAR(50),
  quantity DECIMAL(18, 8) NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
  current_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'IDR',
  platform VARCHAR(100),
  notes TEXT,
  icon VARCHAR(10) DEFAULT '📈',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment_transactions table
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'buy', 'sell', 'dividend', 'stock_split'
  quantity DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 2) NOT NULL,
  total_amount DECIMAL(18, 2) NOT NULL,
  fees DECIMAL(18, 2) DEFAULT 0,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for investments
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for investment_transactions
CREATE POLICY "Users can view own investment transactions"
  ON investment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investment transactions"
  ON investment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment transactions"
  ON investment_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment transactions"
  ON investment_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX idx_investment_transactions_date ON investment_transactions(date DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_investments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_investments_updated_at();
