-- Add currency column to wallets table
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';

-- Add currency column to split_bills table for future use
-- Split Bills feature
CREATE TABLE IF NOT EXISTS split_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'settled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS split_bill_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  split_bill_id UUID REFERENCES split_bills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for split_bills
CREATE POLICY "Users can view own split bills" ON split_bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create split bills" ON split_bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own split bills" ON split_bills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own split bills" ON split_bills
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for participants (via split_bill ownership)
CREATE POLICY "Users can view split bill participants" ON split_bill_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM split_bills WHERE split_bills.id = split_bill_participants.split_bill_id AND split_bills.user_id = auth.uid())
  );

CREATE POLICY "Users can manage split bill participants" ON split_bill_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM split_bills WHERE split_bills.id = split_bill_participants.split_bill_id AND split_bills.user_id = auth.uid())
  );

CREATE POLICY "Users can update split bill participants" ON split_bill_participants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM split_bills WHERE split_bills.id = split_bill_participants.split_bill_id AND split_bills.user_id = auth.uid())
  );

CREATE POLICY "Users can delete split bill participants" ON split_bill_participants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM split_bills WHERE split_bills.id = split_bill_participants.split_bill_id AND split_bills.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_split_bills_user_id ON split_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_split_bill_participants_bill_id ON split_bill_participants(split_bill_id);
