# Grand Line Meta

A production-oriented Next.js 15 application for competitive One Piece Card Game decklists, tournament results, matchup stats, and meta analytics.

## Stack

- Next.js 15 App Router, React, TypeScript strict mode
- TailwindCSS v4 with shadcn/ui-style primitives
- Firebase Authentication, Firestore, and Storage
- TanStack Query for cached client data
- Zod and React Hook Form validation
- Framer Motion interactions
- Recharts analytics visualizations
- Vercel optimized deployment config

## Folder structure

```txt
src/
  app/                  App Router pages, metadata, loading and error boundaries
  components/           Shared UI primitives and feature components
  hooks/                Reusable app hooks
  lib/                  Firebase, typed services, analytics, SEO, validation, mock data
scripts/                Seed script for cards, decks, tournaments, players, snapshots
public/                 Static card placeholder assets
docs/                   Firestore schema and production notes
```

## Firestore schema

See [`docs/firestore-schema.md`](docs/firestore-schema.md). Rules and indexes live in `firestore.rules`, `storage.rules`, and `firestore.indexes.json`.

## Environment setup

1. Copy `.env.example` to `.env.local`.
2. Create a Firebase project with Authentication, Firestore, and Storage enabled.
3. Enable Google and Email/Password sign-in providers.
4. Add the Firebase web app values to the `NEXT_PUBLIC_FIREBASE_*` variables.
5. Optional: provide `FIREBASE_SERVICE_ACCOUNT_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` to seed Firestore.

If Firebase variables are absent, the app runs against mock seed data.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Seed data

```bash
npm run seed
```

The seed script writes example cards, decklists, tournaments, players, and weekly meta snapshots to Firestore when admin credentials are configured.

## Deployment

- Import into Vercel and add Firebase environment variables.
- Deploy with the included `vercel.json` and Next.js preset.
- Deploy Firebase rules and indexes with:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Production notes

- Analytics pages are chart islands over cache-friendly server shells.
- Public deck, card, tournament, and meta reads can be backed by aggregated `metaSnapshots` documents.
- Role-based admin protections are enforced in Firestore rules and mirrored in client UX.
- Dynamic metadata, Open Graph defaults, sitemap, robots, and JSON-LD structured data are included.
