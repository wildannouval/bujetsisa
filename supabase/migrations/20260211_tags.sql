-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for transaction-tag relationship
CREATE TABLE IF NOT EXISTS transaction_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(transaction_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transaction_tags (via join to tags)
CREATE POLICY "Users can view own transaction tags" ON transaction_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tags WHERE tags.id = transaction_tags.tag_id AND tags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own transaction tags" ON transaction_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tags WHERE tags.id = transaction_tags.tag_id AND tags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transaction tags" ON transaction_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tags WHERE tags.id = transaction_tags.tag_id AND tags.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_tags_transaction_id ON transaction_tags(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag_id ON transaction_tags(tag_id);
