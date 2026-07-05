# Game Ranker

Rank your top 10 favorite games, share your list, and compare your taste with other players.

Built with Next.js (App Router), Better Auth, Postgres (Neon), dnd-kit, and the IGDB API. Deploys to Vercel.

## Features

- Sign in with email and password, Google, or Discord
- Search any game via IGDB and build a ranked top 10 with drag and drop
- Public profile page for every player at `/u/username`
- Side-by-side comparison of two lists with a taste match score
- Community chart: aggregate top games across all lists (#1 pick = 10 points, #10 = 1 point)

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in values, see below
npm run db:migrate           # creates app tables and Better Auth tables
npm run dev
```

The app needs `DATABASE_URL` and `BETTER_AUTH_SECRET`. Email/password auth is always available; the Google/Discord buttons and game search light up once their keys are added.

### Credentials

1. **Postgres** ([neon.tech](https://neon.tech), free tier)
   - Create a project, copy the pooled connection string (host contains `-pooler`) as `DATABASE_URL`
   - Tip: create a second Neon branch for local dev so it stays separate from production data
2. **Google OAuth** ([console.cloud.google.com](https://console.cloud.google.com))
   - Create a project and configure the OAuth consent screen (External, Testing mode is fine, add your email as a test user)
   - Credentials > Create credentials > OAuth client ID > Web application
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. **Discord OAuth** ([discord.com/developers/applications](https://discord.com/developers/applications))
   - New Application > OAuth2
   - Add redirect: `http://localhost:3000/api/auth/callback/discord`
4. **IGDB via Twitch** ([dev.twitch.tv/console](https://dev.twitch.tv/console), requires a Twitch account with 2FA)
   - Register an application (category: Application Integration, OAuth redirect can be `http://localhost`)
   - Use its client ID and secret as `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`

## Deploying to Vercel

Production domain: `ranker.jadenlabs.me`

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new), then add the custom domain in the Vercel project settings
2. Set the environment variables from `.env.example` in the Vercel project settings, with one change:
   - `BETTER_AUTH_URL` = `https://ranker.jadenlabs.me`
3. Run the migration once against the production database: `npm run db:migrate` (already done if local `.env.local` points at the same Neon database)
4. Add the production redirect URIs in the provider consoles:
   - Google: `https://ranker.jadenlabs.me/api/auth/callback/google`
   - Discord: `https://ranker.jadenlabs.me/api/auth/callback/discord`

## Data

Postgres schema: Better Auth manages the `user`, `session`, `account`, and `verification` tables; the app adds `game` (cached IGDB metadata) and `ranking` (user_id, game_id, position 1 to 10). Both are created by `npm run db:migrate` (see `scripts/init-db.mjs`).
