CREATE TABLE IF NOT EXISTS director_graph (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  director_name TEXT NOT NULL,
  wikidata_id TEXT UNIQUE,
  tmdb_person_id INT,
  influenced_by TEXT[],
  movements TEXT[],
  awards TEXT[],
  nationality TEXT,
  active_decades TEXT,
  enriched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_director_graph_name ON director_graph(director_name);
CREATE INDEX IF NOT EXISTS idx_director_graph_tmdb ON director_graph(tmdb_person_id);
