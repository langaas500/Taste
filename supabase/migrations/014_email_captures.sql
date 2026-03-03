CREATE TABLE IF NOT EXISTS email_captures (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  tmdb_id     INTEGER,
  title       TEXT,
  type        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures (email);
