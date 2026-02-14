# WatchLedger

Track what you watch. Get smart, AI-powered recommendations.

## Features

- **Search** movies & TV shows via TMDB with quick-action buttons (Like, Dislike, Neutral, Watchlist)
- **Library** with filters: watched (liked/disliked/neutral), excluded
- **Watchlist** for titles you plan to watch
- **Recommendations** — 20 personalized picks with AI-generated "why" explanations and tags
- **Taste Profile** — AI summary of your viewing preferences
- **Stats** — viewing breakdown by genre, sentiment, type
- **Trakt Sync** — import watched history, ratings, and watchlist via OAuth
- **Settings** — exploration slider, AI provider test, data export

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + Postgres with RLS)
- TMDB API for metadata
- Trakt OAuth + API for sync
- AI: Anthropic or OpenAI (selectable via env var)

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. From **Settings > API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Run Database Migrations

1. Open your Supabase project's **SQL Editor**
2. Paste the contents of `supabase/migration.sql` and run it
3. This creates all tables, RLS policies, indexes, and the auto-profile trigger

### 3. Get a TMDB API Key

1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to **Settings > API** and request an API key
3. Use the **API Read Access Token** (v4 auth, starts with `eyJ...`) → `TMDB_API_KEY`

### 4. Create a Trakt App

1. Go to [trakt.tv/oauth/applications/new](https://trakt.tv/oauth/applications/new)
2. Set the redirect URI to `http://localhost:3000/api/trakt/callback` (or your deployed URL)
3. Copy:
   - Client ID → `TRAKT_CLIENT_ID`
   - Client Secret → `TRAKT_CLIENT_SECRET`
   - Set `TRAKT_REDIRECT_URI` to match the redirect URI above

### 5. Get an AI API Key

Choose one:
- **Anthropic**: Get a key at [console.anthropic.com](https://console.anthropic.com)
- **OpenAI**: Get a key at [platform.openai.com](https://platform.openai.com)

### 6. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TMDB_API_KEY=your-tmdb-read-access-token
TRAKT_CLIENT_ID=your-trakt-client-id
TRAKT_CLIENT_SECRET=your-trakt-client-secret
TRAKT_REDIRECT_URI=http://localhost:3000/api/trakt/callback
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key
```

### 7. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 8. Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add all env vars from `.env.local` to Vercel's Environment Variables
4. Update `TRAKT_REDIRECT_URI` to your production URL (`https://your-app.vercel.app/api/trakt/callback`)

## Environment Variables

| Variable | Required | Where |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only |
| `TMDB_API_KEY` | Yes | Server only |
| `TRAKT_CLIENT_ID` | Yes | Server only |
| `TRAKT_CLIENT_SECRET` | Yes | Server only |
| `TRAKT_REDIRECT_URI` | Yes | Server only |
| `AI_PROVIDER` | Yes | Server only |
| `ANTHROPIC_API_KEY` | If using Anthropic | Server only |
| `OPENAI_API_KEY` | If using OpenAI | Server only |

## Security

- All API keys (TMDB, Trakt, AI, Supabase service role) are server-only
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the client
- Row Level Security (RLS) enforced on all user-owned tables
- `titles_cache` is readable by authenticated users, writable only via service role
- `trakt_tokens` has no user-facing RLS policies — only accessible via server routes
