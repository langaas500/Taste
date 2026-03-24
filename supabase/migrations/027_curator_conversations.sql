CREATE TABLE IF NOT EXISTS curator_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  messages JSONB NOT NULL DEFAULT '[]',
  recommended_tmdb_ids INTEGER[] DEFAULT '{}',
  session_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_curator_conversations_user_id ON curator_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_curator_conversations_updated_at ON curator_conversations(updated_at DESC);

ALTER TABLE curator_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curator_conversations' AND policyname = 'Users can read own conversations') THEN
  CREATE POLICY "Users can read own conversations"
    ON curator_conversations FOR SELECT
    USING (auth.uid() = user_id);
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curator_conversations' AND policyname = 'Users can insert own conversations') THEN
  CREATE POLICY "Users can insert own conversations"
    ON curator_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curator_conversations' AND policyname = 'Users can update own conversations') THEN
  CREATE POLICY "Users can update own conversations"
    ON curator_conversations FOR UPDATE
    USING (auth.uid() = user_id);
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'curator_conversations' AND policyname = 'Users can delete own conversations') THEN
  CREATE POLICY "Users can delete own conversations"
    ON curator_conversations FOR DELETE
    USING (auth.uid() = user_id);
END IF;
END $$;
