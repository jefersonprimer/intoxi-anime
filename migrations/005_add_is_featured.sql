ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS posts_is_featured_idx ON posts (is_featured DESC, created_at DESC);