# Recipe Reel

Turn Instagram Reels into saved recipe cards with AI-powered extraction.

## What it does

- Paste an Instagram reel URL + caption → Claude AI extracts title, ingredients, method, and tags
- Saves recipes to a catalog with thumbnail, cook time, servings
- Builds a shopping list from multiple recipes, grouped by shop section (Veg, Meat, Dairy, Bakery, Cupboard, etc.)
- Quantities are automatically combined when recipes share ingredients
- Export your shopping list as a text file

## Instagram API

The [Instagram oEmbed API](https://developers.facebook.com/docs/instagram/oembed) returns:
- `title` — the full post caption (this is where the recipe lives)
- `author_name` — the creator's username
- `thumbnail_url` — a preview image

This requires a Meta app access token. If you don't have one, just paste the caption manually — the app supports both flows.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI**: Claude API (Anthropic) for recipe extraction
- **Auth + DB**: Supabase (Postgres + Row Level Security)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial.sql` in the SQL editor
3. Copy your project URL and anon key

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in ANTHROPIC_API_KEY (required)
# Fill in INSTAGRAM_ACCESS_TOKEN (optional - enables auto-fetch from URL)
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:5173

## Getting an Anthropic API key

Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

## Getting an Instagram access token (optional)

1. Create a Meta Developer app at [developers.facebook.com](https://developers.facebook.com)
2. Add the Instagram product
3. Generate an app access token: `{app_id}|{app_secret}`

Without this token the app still works — users paste the caption text manually.

## Future features

- [ ] Share recipe collections with other users / couples
- [ ] Weekly meal planner
- [ ] Nutritional info
- [ ] Auto-fetch caption via Instagram API
