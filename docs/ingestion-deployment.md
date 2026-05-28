# All Blue Ingestion — Deployment Guide

## Overview

The ingestion system scrapes tournament and decklist data from multiple OP TCG sources, normalizes and deduplicates records into canonical Firestore collections, and exposes them via Next.js API routes.

**Stack:** Next.js 15 (Vercel) + Firebase Firestore + Cloud Functions (job queue)

## Environment variables

### Next.js (`.env.local`)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
NEXT_PUBLIC_APP_URL=https://allblue.gg
SCRAPE_USER_AGENT=AllBlueBot/1.0 (+https://allblue.gg/bot)
INGESTION_ENABLED=true
# Optional: comma-separated sources to disable
# INGESTION_DISABLED_SOURCES=gumgum,egman
OP_TOP_DECKS_URL=https://onepiecetopdecks.com/deck-list/...
```

### Firebase Functions

Set the same `FIREBASE_SERVICE_ACCOUNT` via Firebase console or use default application credentials when deployed.

## Deploy Firestore rules & indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Update `.firebaserc` with your real project ID.

## Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

Scheduled jobs:

| Function | Schedule | Purpose |
|----------|----------|---------|
| `scheduleMajorTournaments` | Every 30 min | Enqueue Limitless/Egman tournament sweeps |
| `scheduleDeckDatabases` | Every 6 hours | Full deck DB + OP Top Decks |
| `scheduleMetaNightly` | 3:00 AM CT | Meta snapshot recalculation |
| `retryFailedJobs` | Every 15 min | Retry failed jobs with backoff |
| `onScrapeJobWrite` | Firestore trigger | Process queued jobs |

## Deploy Next.js (Vercel)

1. Connect repo to Vercel
2. Set environment variables (including `FIREBASE_SERVICE_ACCOUNT_KEY`)
3. Deploy — API routes at `/api/*` use Admin SDK when credentials are present

## Local development

### Scrape to JSON (no Firestore)

```bash
npm run scrape:op15
npm run scrape:egman
npm run scrape:egman -- --id sangsang-merida-top-16
```

Egman crawls [one-piece-op15-tournaments](https://egmanevents.com/one-piece-op15-tournaments) via Squarespace JSON, including placements and decklists from each event page.

### Enqueue + process job locally

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='...'
npm run scrape:enqueue -- --source limitless --type tournaments
npm run scrape:local -- --source onepiecetopdecks --type decklists --id op15-japan
npm run scrape:local -- --source egman --type tournaments
npm run scrape:local -- --source egman --type decklists --id sangsang-merida-top-16
```

### Seed mock + OP15 data

```bash
npm run seed
```

## Source priority

When records conflict, higher-trust sources win:

1. Limitless
2. Egman
3. OnePiece.gg
4. GumGum
5. OnePieceTopDecks

## Collections

| Collection | Purpose |
|------------|---------|
| `scrapeJobs` | Job queue |
| `rawSnapshots` | Cached HTML |
| `canonicalTournaments` | Deduplicated events |
| `canonicalDecks` | Deduplicated decks |
| `sourceMappings` | External ID → canonical ID |
| `tournaments`, `decklists` | Public denormalized views |

## Admin dashboard

Visit `/admin/ingestion` (requires Firebase admin data) for scrape job health and failures.

## Playwright in Cloud Functions

Limitless decklist pages may use Playwright (`playwright-core`). Ensure Functions have ≥1GB memory and 540s timeout (configured in `functions/src/index.ts`).
