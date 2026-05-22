-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT         NOT NULL,
  description   TEXT,
  instagram_url TEXT,
  instagram_creator TEXT,
  thumbnail_url TEXT,
  ingredients   JSONB        NOT NULL DEFAULT '[]',
  method        JSONB        NOT NULL DEFAULT '[]',
  tags          TEXT[]       DEFAULT '{}',
  servings      INTEGER,
  prep_time     TEXT,
  cook_time     TEXT,
  created_at    TIMESTAMPTZ  DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ  DEFAULT now() NOT NULL
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL,
  recipe_ids  UUID[]      DEFAULT '{}',
  items       JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own shopping lists" ON shopping_lists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
